import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateItemSchema = z.object({
  title: z.string(),
  price: z.coerce.number().min(0).max(999999),
});

export class CreateItemDto extends createZodDto(CreateItemSchema) {}
