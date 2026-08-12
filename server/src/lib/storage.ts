import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';

export interface BookingRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  phone: string;
  email?: string;
  comment?: string;
  start: string;
  end: string;
  createdAt: string;
  remindedAt?: string;
  status: 'confirmed' | 'cancelled';
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
  [key: string]: unknown;
}

export interface DemoBusy {
  start: string;
  end: string;
  label?: string;
}

function ensureDir(): void {
  mkdirSync(env.dataDir, { recursive: true });
}

function read<T>(name: string, fallback: T): T {
  ensureDir();
  const path = join(env.dataDir, name);
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function write(name: string, data: unknown): void {
  ensureDir();
  writeFileSync(join(env.dataDir, name), JSON.stringify(data, null, 2));
}

export const storage = {
  getTokens(): GoogleTokens | null {
    return read('google-tokens.json', null);
  },
  setTokens(tokens: GoogleTokens): void {
    write('google-tokens.json', tokens);
  },
  clearTokens(): void {
    write('google-tokens.json', null);
  },
  getBookings(): BookingRecord[] {
    return read('bookings.json', []);
  },
  addBooking(
    b: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>,
  ): BookingRecord {
    const bookings = this.getBookings();
    const record: BookingRecord = {
      ...b,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };
    bookings.push(record);
    write('bookings.json', bookings);
    return record;
  },
  updateBooking(id: string, patch: Partial<BookingRecord>): void {
    const bookings = this.getBookings().map((b) =>
      b.id === id ? { ...b, ...patch } : b,
    );
    write('bookings.json', bookings);
  },
  getDemoBusy(): DemoBusy[] {
    return read('demo-busy.json', []);
  },
  setDemoBusy(items: DemoBusy[]): void {
    write('demo-busy.json', items);
  },
};
