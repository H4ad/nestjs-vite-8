import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { users } from '../database/schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly db: DrizzleService) {}

  async onModuleInit() {
    const count = await this.db.db.select().from(users);
    if (count.length === 0) {
      await this.db.db.insert(users).values({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        bio: 'Developer',
      });
    }
  }

  async findAll(): Promise<
    Array<Omit<typeof users.$inferSelect, 'id'> & { id: string }>
  > {
    const rows = await this.db.db.select().from(users);
    return rows.map((u) => ({ ...u, id: String(u.id) }));
  }

  async findOne(
    id: string,
  ): Promise<Omit<typeof users.$inferSelect, 'id'> & { id: string }> {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)));
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return { ...user, id: String(user.id) };
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<typeof users.$inferSelect, 'id'> & { id: string }> {
    const [saved] = await this.db.db
      .insert(users)
      .values(createUserDto)
      .returning();
    if (!saved) throw new Error('Insert failed');
    return { ...saved, id: String(saved.id) };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<typeof users.$inferSelect, 'id'> & { id: string }> {
    await this.findOne(id);
    await this.db.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, Number(id)));
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.db.db
      .delete(users)
      .where(eq(users.id, Number(id)))
      .returning({ id: users.id });
    if (deleted.length === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}
