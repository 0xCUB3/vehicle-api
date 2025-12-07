import 'dotenv/config';
import { buildApp } from '../src/app.js';

const app = await buildApp();

export default async function handler(req: Request): Promise<Response> {
  await app.ready();
  return app.fetch(req);
}
