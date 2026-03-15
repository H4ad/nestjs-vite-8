import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { items } from '../database/schema.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';

const SEED_ITEM_ID = '550e8400-e29b-41d4-a716-446655440000';

@Injectable()
export class ItemsService {
  constructor(private readonly db: DrizzleService) {}

  async onModuleInit() {
    const count = await this.db.db.select().from(items);
    if (count.length === 0) {
      await this.db.db.insert(items).values({
        id: SEED_ITEM_ID,
        title: 'Widget',
        price: 999,
      });
    }
  }

  async findAll(): Promise<(typeof items.$inferSelect)[]> {
    return this.db.db.select().from(items);
  }

  async findOne(id: string): Promise<typeof items.$inferSelect> {
    const [item] = await this.db.db
      .select()
      .from(items)
      .where(eq(items.id, id));
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async create(
    createItemDto: CreateItemDto,
  ): Promise<typeof items.$inferSelect> {
    const [saved] = await this.db.db
      .insert(items)
      .values(createItemDto)
      .returning();
    if (!saved) throw new Error('Insert failed');
    return saved;
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto,
  ): Promise<typeof items.$inferSelect> {
    await this.findOne(id);
    await this.db.db.update(items).set(updateItemDto).where(eq(items.id, id));
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.db.db
      .delete(items)
      .where(eq(items.id, id))
      .returning({ id: items.id });
    if (deleted.length === 0) {
      throw new NotFoundException(`Item #${id} not found`);
    }
  }
}
