import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { ExitPort } from '../../entities/exitPort.entity';

export class ExitPortsResponseDto extends ResponseFilterDto<ExitPort[]> {
  @ApiProperty({ description: 'Listado de puerto de salida', type: ExitPort, isArray: true })
  @IsArray()
  items: ExitPort[];
}