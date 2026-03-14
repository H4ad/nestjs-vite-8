import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ minimum: 0, maximum: 999999 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999999)
  price: number;
}
