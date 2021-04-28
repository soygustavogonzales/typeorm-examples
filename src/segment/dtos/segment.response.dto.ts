import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Segment } from '../../entities/segment.entity';

export class SegmentResponseDto extends ResponseFilterDto<Segment[]> {
  @ApiProperty({ description: 'Listado de segmentos', type: Segment, isArray: true })
  @IsArray()
  items: Segment[];
}