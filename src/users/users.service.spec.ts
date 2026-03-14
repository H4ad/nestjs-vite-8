import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { createPgMemDataSource } from '../database/pg-mem-testing.js';
import { describe, beforeEach, it, expect } from 'vitest';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({ type: 'postgres' as const, entities: [User] }),
          dataSourceFactory: createPgMemDataSource,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    await module.init();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
      expect(result.name).toBe('Alice');
      expect(result.email).toBe('alice@example.com');
      expect(result.bio).toBe('Developer');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { name: 'Bob', email: 'bob@example.com' };
      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Bob');
      expect(result.email).toBe('bob@example.com');
    });

    it('should create a user with optional bio', async () => {
      const dto = { name: 'Carol', email: 'carol@example.com', bio: 'Designer' };
      const result = await service.create(dto);
      expect(result.bio).toBe('Designer');
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const result = await service.update('1', { name: 'Alice Updated' });
      expect(result.id).toBe('1');
      expect(result.name).toBe('Alice Updated');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an existing user', async () => {
      const created = await service.create({
        name: 'Temp',
        email: 'temp@example.com',
      });
      await service.remove(created.id);
      await expect(service.findOne(created.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
