import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Shipmethod } from '../../entities/shipmethod.entity';

export class ShipMethodResponseDto extends ResponseFilterDto<Shipmethod[]> {
  @ApiProperty({ description: 'Listado de metodo de embarque', type: Shipmethod, isArray: true })
  @IsArray()
  items: Shipmethod[];
}