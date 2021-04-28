import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Category } from '../../entities/category.entity';

export class CategoryResponseDto extends ResponseFilterDto<Category[]> {
  @ApiProperty({ description: 'Listado de categortias', type: Category, isArray: true })
  @IsArray()
  items: Category[];
}