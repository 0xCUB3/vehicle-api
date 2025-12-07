import 'dotenv/config';
import { buildApp } from '../src/app.js';
import type { IncomingMessage, ServerResponse } from 'http';

let app: Awaited<ReturnType<typeof buildApp>>;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!app) {
    app = await buildApp();
  }
  await app.ready();
  app.server.emit('request', req, res);
}
