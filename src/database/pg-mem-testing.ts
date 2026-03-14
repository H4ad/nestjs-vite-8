import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { DataType, newDb } from 'pg-mem';
import { Item } from '../items/entities/item.entity.js';
import { User } from '../users/entities/user.entity.js';

const entities = [User, Item];

export async function createPgMemDataSource(): Promise<DataSource> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 15.0',
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: randomUUID,
      impure: true,
    });
  });

  const ds = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities,
  });
  await ds.initialize();
  await ds.synchronize();
  return ds;
}
