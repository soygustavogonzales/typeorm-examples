import { ApiProperty } from '@nestjs/swagger';
import { DateRangeDto } from '../../shared/dtos/dateRange.dto';


export class FilterSustainabilityDto {
  @ApiProperty({
    description: 'Id de la subscription al reporte',
    example: '036e4e04-10e6-4cf5-a830-084033aaa751',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Ids de temporadas comerciales',
    example: [],
    isArray: true,
  })
  seasons?: number[];

  @ApiProperty({
    description: 'Ids de departamentos',
    example: [],
    isArray: true,
  })
  departments?: number[];

  @ApiProperty({
    description: 'Ids de marcas',
    example: [],
    isArray: true,
  })
  brands?: number[];

  @ApiProperty({
    description: 'Ids de categorias',
    example: [],
    isArray: true,
  })
  categories?: number[];

  @ApiProperty({
    description: 'Ids de rse',
    example: [],
    isArray: true,
  })
  rses?: number[];

  @ApiProperty({
    description: 'Ids de los merchants',
    example: [],
    isArray: true,
  })
  merchants?: number[];

  @ApiProperty({
    description: 'ClassTypes',
    example: [1, 2, 3],
    isArray: true,
  })
  classTypes?: number[];
}
