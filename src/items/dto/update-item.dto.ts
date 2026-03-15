import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateItemSchema = z.object({
  title: z.string().optional(),
  price: z.coerce.number().min(0).max(999999).optional(),
});

export class UpdateItemDto extends createZodDto(UpdateItemSchema) {}
