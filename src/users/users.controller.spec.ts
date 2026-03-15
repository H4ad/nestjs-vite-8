import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const mockUsersService = {
      findAll: vi
        .fn()
        .mockResolvedValue([
          { id: '1', name: 'Alice', email: 'alice@example.com' },
        ]),
      findOne: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      }),
      create: vi.fn().mockResolvedValue({
        id: '2',
        name: 'Test User',
        email: 'test@example.com',
      }),
      update: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Alice Updated',
        email: 'alice@example.com',
      }),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('1');
      expect(result.id).toBe('1');
      expect(result.name).toBe('Alice');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { name: 'Test User', email: 'test@example.com' };
      const result = await controller.create(dto);
      expect(result.name).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const result = await controller.update('1', { name: 'Alice Updated' });
      expect(result.id).toBe('1');
      expect(result.name).toBe('Alice Updated');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await expect(controller.remove('1')).resolves.not.toThrow();
    });
  });
});
