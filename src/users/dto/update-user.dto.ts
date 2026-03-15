import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(200).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
