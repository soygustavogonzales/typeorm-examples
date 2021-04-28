import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { Provider } from '../../entities/provider.entity';

export class ProvidersResponseDto extends ResponseFilterDto<Provider[]> {
  @ApiProperty({ description: 'Listado de contratos', type: Provider, isArray: true })
  @IsArray()
  items: Provider[];
}