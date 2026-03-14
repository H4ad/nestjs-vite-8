import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { Item } from './entities/item.entity.js';
import { createPgMemDataSource } from '../database/pg-mem-testing.js';
import { describe, beforeEach, it, expect } from 'vitest';

const EXISTING_ITEM_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({ type: 'postgres' as const, entities: [Item] }),
          dataSourceFactory: createPgMemDataSource,
        }),
        TypeOrmModule.forFeature([Item]),
      ],
      providers: [ItemsService],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    await module.init();
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const result = await service.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('price');
    });
  });

  describe('findOne', () => {
    it('should return an item by id', async () => {
      const result = await service.findOne(EXISTING_ITEM_ID);
      expect(result.id).toBe(EXISTING_ITEM_ID);
      expect(result.title).toBe('Widget');
      expect(result.price).toBe(999);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const dto = { title: 'New Item', price: 100 };
      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('New Item');
      expect(result.price).toBe(100);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const result = await service.update(EXISTING_ITEM_ID, {
        title: 'Updated Widget',
      });
      expect(result.id).toBe(EXISTING_ITEM_ID);
      expect(result.title).toBe('Updated Widget');
      expect(result.price).toBe(999);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          title: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an existing item', async () => {
      const dto = { title: 'To Remove', price: 1 };
      const created = await service.create(dto);
      await service.remove(created.id);
      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when item does not exist', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
