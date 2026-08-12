import type { Request, Response } from 'express';

interface Client {
  id: number;
  res: Response;
}

let clients: Client[] = [];
let nextId = 1;

export function sseConnect(req: Request, res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const client: Client = { id: nextId++, res };
  clients.push(client);
  res.write(`event: connected\ndata: ${JSON.stringify({ clients: clients.length })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter((c) => c.id !== client.id);
  });
}

export function sseBroadcast(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) {
    try {
      c.res.write(payload);
    } catch {
      // ignore dead clients
    }
  }
}

export function sseClientCount(): number {
  return clients.length;
}
