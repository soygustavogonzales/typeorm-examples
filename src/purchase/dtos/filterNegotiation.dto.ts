import { ApiProperty } from '@nestjs/swagger';

export class FilterNegotiationDto {
  @ApiProperty({
    description: 'Ids de temporadas comerciales',
    example: [],
    isArray: true,
  })
  seasons: number[];

  @ApiProperty({
    description: 'Ids de marcas',
    example: [],
    isArray: true,
  })
  brands: number[];

  @ApiProperty({
    description: 'Ids de departamentos',
    example: [],
    isArray: true,
  })
  departments: number[];

  @ApiProperty({
    description: 'Fechas de viaje',
    example: [],
    isArray: true,
  })
  tripDates: string[];

  @ApiProperty({
    description: 'Ids de usuarios dueños de compras',
    example: [],
    isArray: true,
  })
  users: number[];
}
