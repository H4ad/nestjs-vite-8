import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller.js';
import { ItemsService } from './items.service.js';
import { describe, beforeEach, it, expect, vi } from 'vitest';

const EXISTING_ITEM_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    const mockItemsService = {
      findAll: vi.fn().mockResolvedValue([{ id: EXISTING_ITEM_ID, title: 'Widget', price: 999 }]),
      findOne: vi.fn().mockResolvedValue({ id: EXISTING_ITEM_ID, title: 'Widget', price: 999 }),
      create: vi.fn().mockResolvedValue({ id: 'uuid', title: 'Test Item', price: 50 }),
      update: vi.fn().mockResolvedValue({ id: EXISTING_ITEM_ID, title: 'Widget', price: 1234 }),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const result = await controller.findAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('findOne', () => {
    it('should return an item by id', async () => {
      const result = await controller.findOne(EXISTING_ITEM_ID);
      expect(result.id).toBe(EXISTING_ITEM_ID);
    });
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const dto = { title: 'Test Item', price: 50 };
      const result = await controller.create(dto);
      expect(result.title).toBe('Test Item');
      expect(result.price).toBe(50);
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const result = await controller.update(EXISTING_ITEM_ID, { price: 1234 });
      expect(result.id).toBe(EXISTING_ITEM_ID);
      expect(result.price).toBe(1234);
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      await expect(controller.remove(EXISTING_ITEM_ID)).resolves.not.toThrow();
    });
  });
});
