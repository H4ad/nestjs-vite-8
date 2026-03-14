import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto.js';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
