import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { Item } from './entities/item.entity.js';

const SEED_ITEM_ID = '550e8400-e29b-41d4-a716-446655440000';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  async onModuleInit() {
    const count = await this.itemRepo.count();
    if (count === 0) {
      await this.itemRepo.save({
        id: SEED_ITEM_ID,
        title: 'Widget',
        price: 999,
      });
    }
  }

  async findAll(): Promise<Item[]> {
    return this.itemRepo.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemRepo.create(createItemDto);
    return this.itemRepo.save(item);
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    await this.findOne(id);
    await this.itemRepo.update(id, updateItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item #${id} not found`);
    }
  }
}
