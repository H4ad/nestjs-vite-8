import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(200).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
