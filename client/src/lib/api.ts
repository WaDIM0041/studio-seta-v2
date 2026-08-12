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
  closed: boolean;
  closedReason?: 'weekend' | 'date' | null;
  fill: number;
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
  closed?: boolean;
  closedReason?: 'weekend' | 'date' | null;
  fill?: number;
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

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
  emailVerified: boolean;
}

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

const SERVICES: ServiceDef[] = [
  { id: 'comb-manicure', name: 'Маникюр комби', price: 2200, durationMin: 90, category: 'Маникюр', note: 'Имеются противопоказания', popular: true },
  { id: 'hard-gel', name: 'Укрепление Hard Gel', price: 2600, durationMin: 120, category: 'Маникюр', note: 'Имеются противопоказания. Возраст 16+', popular: true },
  { id: 'extension', name: 'Донаращивание', price: 1800, durationMin: 90, category: 'Маникюр', note: 'Имеются противопоказания' },
  { id: 'gel-polish', name: 'Покрытие гель-лак', price: 800, durationMin: 45, category: 'Маникюр' },
  { id: 'design', name: 'Дизайн ногтей', price: 500, durationMin: 30, category: 'Дизайн' },
  { id: 'art-sculpt', name: 'Авторский дизайн SETA Art', price: 1500, durationMin: 60, category: 'Дизайн', note: 'Имеются противопоказания' },
  { id: 'pedicure', name: 'Педикюр аппаратный', price: 3000, durationMin: 120, category: 'Педикюр', note: 'Имеются противопоказания' },
  { id: 'removal', name: 'Снятие покрытия', price: 400, durationMin: 20, category: 'Уход' }
];

function getLocalBookings(): any[] {
  try {
    const raw = localStorage.getItem('seta_bookings_v2');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBooking(booking: any): void {
  const list = getLocalBookings();
  list.push(booking);
  localStorage.setItem('seta_bookings_v2', JSON.stringify(list));
}

function calculateEndTime(timeStr: string, durationMin: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + durationMin;
  const eh = String(Math.floor(total / 60)).padStart(2, '0');
  const em = String(total % 60).padStart(2, '0');
  return `${eh}:${em}`;
}

function getSeededBusy(dateStr: string): Array<{ start: string; end: string }> {
  const day = new Date(dateStr).getDate();
  const busy: Array<{ start: string; end: string }> = [];
  if (day % 3 === 0) {
    busy.push({ start: `${dateStr}T12:00:00`, end: `${dateStr}T13:00:00` });
    busy.push({ start: `${dateStr}T16:00:00`, end: `${dateStr}T16:30:00` });
  } else if (day % 3 === 1) {
    busy.push({ start: `${dateStr}T11:00:00`, end: `${dateStr}T12:30:00` });
    busy.push({ start: `${dateStr}T17:00:00`, end: `${dateStr}T18:00:00` });
  } else {
    busy.push({ start: `${dateStr}T13:30:00`, end: `${dateStr}T15:00:00` });
  }
  return busy;
}

const MOCK_CLOSED_OFFSETS = [4, 9];

function isMockClosed(dateStr: string): { closed: boolean; reason: 'weekend' | 'date' | null } {
  const d = new Date(`${dateStr}T12:00:00`);
  if (d.getDay() === 0) return { closed: true, reason: 'weekend' };
  const base = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`);
  const diff = Math.round((d.getTime() - base.getTime()) / 86_400_000);
  if (MOCK_CLOSED_OFFSETS.includes(diff)) return { closed: true, reason: 'date' };
  return { closed: false, reason: null };
}

function mockFill(dateStr: string, busyIntervals: Array<{ start: string; end: string }>): number {
  const startMin = 10 * 60;
  const endMin = 20 * 60;
  const windowMs = (endMin - startMin) * 60_000;
  if (windowMs <= 0) return 0;
  const dayStart = new Date(`${dateStr}T00:00:00`).getTime();
  const ranges = busyIntervals
    .map((b) => ({
      start: Math.max(new Date(b.start).getTime(), dayStart + startMin * 60_000),
      end: Math.min(new Date(b.end).getTime(), dayStart + endMin * 60_000),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);
  let busyMs = 0;
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      busyMs += r.end - r.start;
      cursor = r.end;
    } else if (r.end > cursor) {
      busyMs += r.end - cursor;
      cursor = r.end;
    }
  }
  return Math.min(1, busyMs / windowMs);
}

function mockSlots(dateStr: string, serviceId: string): SlotsResponse {
  const service = SERVICES.find(s => s.id === serviceId) || SERVICES[0];
  const duration = service.durationMin;
  const startHour = 10;
  const endHour = 20;

  const busyIntervals = [...getSeededBusy(dateStr)];
  const localBookings = getLocalBookings();
  for (const b of localBookings) {
    if (b.date === dateStr) {
      busyIntervals.push({
        start: `${dateStr}T${b.time}:00`,
        end: `${dateStr}T${calculateEndTime(b.time, b.durationMin)}:00`
      });
    }
  }

  const { closed, reason } = isMockClosed(dateStr);
  const fill = mockFill(dateStr, busyIntervals);
  const slots: SlotInfo[] = [];

  if (!closed) {
    let currentMin = startHour * 60;
    const maxMin = endHour * 60;

    while (currentMin + duration <= maxMin) {
      const hh = String(Math.floor(currentMin / 60)).padStart(2, '0');
      const mm = String(currentMin % 60).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;

      const endTotal = currentMin + duration;
      const ehh = String(Math.floor(endTotal / 60)).padStart(2, '0');
      const emm = String(endTotal % 60).padStart(2, '0');
      const endTimeStr = `${ehh}:${emm}`;

      const slotStartMs = new Date(`${dateStr}T${timeStr}:00`).getTime();
      const slotEndMs = new Date(`${dateStr}T${endTimeStr}:00`).getTime();

      let isOverlap = false;
      for (const b of busyIntervals) {
        const bStartMs = new Date(b.start).getTime();
        const bEndMs = new Date(b.end).getTime();
        if (slotStartMs < bEndMs && slotEndMs > bStartMs) {
          isOverlap = true;
          break;
        }
      }

      if (!isOverlap) {
        slots.push({
          time: timeStr,
          end: endTimeStr,
          iso: `${dateStr}T${timeStr}:00.000Z`
        });
      }
      currentMin += 30;
    }
  }

  return {
    date: dateStr,
    service: {
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price
    },
    workHours: { start: startHour, end: endHour, tz: 'Europe/Moscow' },
    closed,
    closedReason: reason,
    fill,
    busy: busyIntervals.map(b => ({
      start: b.start.split('T')[1].slice(0, 5),
      end: b.end.split('T')[1].slice(0, 5)
    })),
    slots
  };
}

function mockWeek(serviceId: string, fromStr: string): { serviceId: string; days: DayInfo[] } {
  const days: DayInfo[] = [];
  const start = new Date(fromStr);
  for (let i = 0; i < 7; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    const dateStr = cur.toISOString().slice(0, 10);
    const response = mockSlots(dateStr, serviceId);
    days.push({
      date: dateStr,
      weekday: cur.getDay(),
      label: cur.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      slotsCount: response.slots.length,
      free: response.slots.length > 0,
      closed: response.closed ?? false,
      closedReason: response.closedReason ?? null,
      fill: response.fill ?? 0,
    });
  }
  return { serviceId, days };
}

function mockBook(payload: BookingPayload): BookingResult {
  const service = SERVICES.find(s => s.id === payload.serviceId) || SERVICES[0];
  const slotsResponse = mockSlots(payload.date, payload.serviceId);
  const isFree = slotsResponse.slots.some(s => s.time === payload.time);
  if (!isFree) {
    throw new ApiError('Этот слот уже занят. Пожалуйста, выберите другое время.', 409);
  }
  const booking = {
    id: 'mock_' + Math.random().toString(36).substr(2, 9),
    serviceName: service.name,
    price: service.price,
    start: `${payload.date}T${payload.time}:00.000Z`,
    end: `${payload.date}T${calculateEndTime(payload.time, service.durationMin)}:00.000Z`,
    durationMin: service.durationMin
  };
  saveLocalBooking({
    ...booking,
    date: payload.date,
    time: payload.time,
    durationMin: service.durationMin
  });
  triggerMockEvent('calendar-change');
  return { ok: true, booking };
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
  services: () => {
    if (isGitHubPages) return Promise.resolve({ services: SERVICES });
    return request<{ services: ServiceDef[] }>('/api/services');
  },
  slots: (date: string, serviceId: string) => {
    if (isGitHubPages) return Promise.resolve(mockSlots(date, serviceId));
    return request<SlotsResponse>(`/api/slots?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`);
  },
  week: (serviceId: string, from: string) => {
    if (isGitHubPages) return Promise.resolve(mockWeek(serviceId, from));
    return request<{ serviceId: string; days: DayInfo[] }>(
      `/api/slots/week?serviceId=${encodeURIComponent(serviceId)}&from=${encodeURIComponent(from)}`,
    );
  },
  book: (payload: BookingPayload) => {
    if (isGitHubPages) {
      try {
        return Promise.resolve(mockBook(payload));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return request<BookingResult>('/api/booking', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  calendarStatus: () => {
    if (isGitHubPages) return Promise.resolve({ kind: 'demo', label: 'GitHub Pages (Встроенная симуляция)', configured: true, authorized: true });
    return request<{ kind: string; label: string; configured: boolean; authorized: boolean }>('/api/oauth/status');
  },
  authConfig: () => {
    if (isGitHubPages) return Promise.resolve({ googleSignIn: false, clientId: null });
    return request<{ googleSignIn: boolean; clientId: string | null }>('/api/auth/config');
  },
  googleSignIn: (credential: string) => {
    if (isGitHubPages) throw new ApiError('Google Sign-In недоступен в этом режиме');
    return request<GoogleProfile>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },
  health: () => {
    if (isGitHubPages) return Promise.resolve({ ok: true });
    return request<{ ok: boolean }>('/api/health');
  },
};

const mockListeners: Array<(event: string) => void> = [];
function triggerMockEvent(event: string) {
  for (const cb of mockListeners) {
    try {
      cb(event);
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribe to realtime calendar changes. The server pushes
 * "calendar-change" / "booking" events over SSE whenever the owner
 * modifies the calendar or a new booking lands.
 */
export function subscribeCalendarEvents(onEvent: (event: string) => void): () => void {
  if (isGitHubPages) {
    mockListeners.push(onEvent);
    return () => {
      const idx = mockListeners.indexOf(onEvent);
      if (idx !== -1) mockListeners.splice(idx, 1);
    };
  }

  const es = new EventSource('/api/events/stream');
  es.addEventListener('calendar-change', () => onEvent('calendar-change'));
  es.addEventListener('booking', () => onEvent('booking'));
  es.onerror = () => {
    // EventSource auto-reconnects
  };
  return () => es.close();
}
