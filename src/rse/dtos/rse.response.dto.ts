import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Rse } from '../../entities/rse.entity';

export class RseResponseDto extends ResponseFilterDto<Rse[]> {
  @ApiProperty({ description: 'Listado de Rse', type: Rse, isArray: true })
  @IsArray()
  items: Rse[];
}