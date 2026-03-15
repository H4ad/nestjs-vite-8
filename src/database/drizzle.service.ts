import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export type DrizzleDB = NodePgDatabase<typeof schema>;
export type DrizzleSchema = typeof schema;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;
  private _db: DrizzleDB | null = null;

  get db(): DrizzleDB {
    if (!this._db) {
      throw new Error('Database not initialized');
    }
    return this._db;
  }

  async onModuleInit(): Promise<void> {
    const usePgMem = process.env.NODE_ENV === 'test';
    if (usePgMem) {
      const { createTestDb } = await import('./pglite-testing.js');
      this._db = await createTestDb();
      return;
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this._db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this._db = null;
  }
}
