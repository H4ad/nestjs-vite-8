import { createRequire } from 'node:module';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema.js';

const require = createRequire(import.meta.url);

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  const { pushSchema } =
    require('drizzle-kit/api') as typeof import('drizzle-kit/api');
  const { apply } = await pushSchema(schema, db as never);
  await apply();

  await db.insert(schema.users).values({
    name: 'Alice',
    email: 'alice@example.com',
    bio: 'Developer',
  });

  await db.insert(schema.items).values({
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Widget',
    price: 999,
  });

  return db as import('./drizzle.service.js').DrizzleDB;
}
