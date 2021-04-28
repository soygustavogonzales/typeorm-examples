import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Size } from '../../entities/size.entity';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';

export class SizesResponseDto extends ResponseFilterDto<Size[]> {
  @ApiProperty({ description: 'Listado de contratos', type: Size, isArray: true })
  @IsArray()
  items: Size[];
}
