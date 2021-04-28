import { ApiProperty } from '@nestjs/swagger';

export class FilterApprovalDto {
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
    description: 'Ids de Unidades de Negocio',
    example: [],
    isArray: true,
  })
  stores: number[];

  @ApiProperty({
    description: 'Ids de paises de Origen',
    example: [],
    isArray: true,
  })
  origins: number[];

  @ApiProperty({
    description: 'Ids de proveedores',
    example: [],
    isArray: true,
  })
  providers: number[];

  @ApiProperty({
    description: 'Ids de categorias',
    example: [],
    isArray: true,
  })
  categories: number[];

  @ApiProperty({
    description: 'Ids de usuarios',
    example: [],
    isArray: true,
  })
  users: number[];

  @ApiProperty({
    description: 'Numero de PI',
    example: '607AZPACHSTII21SZXE103SEP',
    isArray: false,
  })
  piName?: string;

  @ApiProperty({
    description: 'Nivel reporte',
    example: 'CompraEstilo',
    isArray: false,
  })
  level?: ReportLevels;

  @ApiProperty({
    description: 'Id de compra',
    example: '1',
    isArray: false,
  })
  purchaseId?: number;

  @ApiProperty({
    description: 'Shippings',
    example: ['E1', 'E3'],
    isArray: true,
  })
  shippings?: string[];
}

enum ReportLevels {
  CompraEstilo = 'CompraEstilo',
  CompraSku = 'CompraSku'
}