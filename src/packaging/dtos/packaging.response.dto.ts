import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Packaging } from '../../entities/packaging.entity';

export class PackagingResponseDto extends ResponseFilterDto<Packaging[]> {
  @ApiProperty({ description: 'Listado de packaging', type: Packaging, isArray: true })
  @IsArray()
  items: Packaging[];
}