export interface BookingInput {
  serviceId?: string;
  date?: string;
  time?: string;
  clientName?: string;
  phone?: string;
  email?: string;
  comment?: string;
  consent?: boolean;
}

export interface ValidBooking {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
}

export type ValidationResult =
  | { ok: true; data: ValidBooking }
  | { ok: false; error: string };

/**
 * Pure input validation for the booking endpoint. Kept separate from the route
 * so the integration flow can be unit-tested without an HTTP layer.
 */
export function validateBookingInput(body: BookingInput): ValidationResult {
  if (body.consent !== true) {
    return {
      ok: false,
      error: 'Необходимо согласие на обработку персональных данных',
    };
  }
  const name = String(body.clientName || '').trim();
  if (name.length < 2) return { ok: false, error: 'Укажите имя' };

  const phone = String(body.phone || '').replace(/[^\d+]/g, '');
  if (!/^\+?\d{10,15}$/.test(phone)) {
    return { ok: false, error: 'Укажите корректный номер телефона' };
  }
  const date = String(body.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'Некорректная дата' };
  }
  const time = String(body.time || '');
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  const hour = timeMatch ? Number(timeMatch[1]) : -1;
  const minute = timeMatch ? Number(timeMatch[2]) : -1;
  if (!timeMatch || hour > 23 || minute > 59) {
    return { ok: false, error: 'Некорректное время' };
  }

  return {
    ok: true,
    data: {
      serviceId: body.serviceId || 'comb-manicure',
      date,
      time,
      name,
      phone,
      email: body.email?.trim() || undefined,
      comment: body.comment?.trim() || undefined,
    },
  };
}
