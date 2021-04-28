import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Cso } from '../../entities/cso.entity';

export class CsoResponseDto extends ResponseFilterDto<Cso[]> {
  @ApiProperty({ description: 'Listado de cso', type: Cso, isArray: true })
  @IsArray()
  items: Cso[];
}