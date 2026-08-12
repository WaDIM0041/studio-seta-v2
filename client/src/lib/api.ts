export interface ServiceDef {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  category: string;
  note?: string;
  popular?: boolean;
}

export interface SlotInfo {
  time: string;
  end: string;
  iso: string;
}

export interface DayInfo {
  date: string;
  weekday: number;
  label: string;
  slotsCount: number;
  free: boolean;
}

export interface SlotsResponse {
  date: string;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
  };
  workHours: { start: number; end: number; tz: string };
  busy: Array<{ start: string; end: string }>;
  slots: SlotInfo[];
}

export interface BookingPayload {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  email?: string;
  comment?: string;
  consent: boolean;
}

export interface BookingResult {
  ok: boolean;
  booking: {
    id: string;
    serviceName: string;
    price: number;
    start: string;
    end: string;
    durationMin: number;
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Не удалось связаться с сервером. Проверьте соединение.');
  }
  if (!res.ok) {
    let message = `Ошибка сервера (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') message = data.error;
    } catch {
      // keep default
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  services: () => request<{ services: ServiceDef[] }>('/api/services'),
  slots: (date: string, serviceId: string) =>
    request<SlotsResponse>(`/api/slots?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`),
  week: (serviceId: string, from: string) =>
    request<{ serviceId: string; days: DayInfo[] }>(
      `/api/slots/week?serviceId=${encodeURIComponent(serviceId)}&from=${encodeURIComponent(from)}`,
    ),
  book: (payload: BookingPayload) =>
    request<BookingResult>('/api/booking', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  calendarStatus: () =>
    request<{ kind: string; label: string; configured: boolean; authorized: boolean }>('/api/oauth/status'),
  health: () => request<{ ok: boolean }>('/api/health'),
};

/**
 * Subscribe to realtime calendar changes. The server pushes
 * "calendar-change" / "booking" events over SSE whenever the owner
 * modifies the calendar or a new booking lands.
 */
export function subscribeCalendarEvents(onEvent: (event: string) => void): () => void {
  const es = new EventSource('/api/events/stream');
  es.addEventListener('calendar-change', () => onEvent('calendar-change'));
  es.addEventListener('booking', () => onEvent('booking'));
  es.onerror = () => {
    // EventSource auto-reconnects
  };
  return () => es.close();
}
