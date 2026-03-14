import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count === 0) {
      await this.userRepo.save({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        bio: 'Developer',
      });
    }
  }

  async findAll(): Promise<Omit<User, 'id'> & { id: string }[]> {
    const users = await this.userRepo.find();
    return users.map((u) => ({ ...u, id: String(u.id) }));
  }

  async findOne(id: string): Promise<Omit<User, 'id'> & { id: string }> {
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return { ...user, id: String(user.id) };
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'id'> & { id: string }> {
    const user = this.userRepo.create(createUserDto);
    const saved = await this.userRepo.save(user);
    return { ...saved, id: String(saved.id) };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'id'> & { id: string }> {
    await this.findOne(id);
    await this.userRepo.update(Number(id), updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepo.delete(Number(id));
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}
