import { DetailsType } from '../../purchase/dtos/detailsType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { FilterTypeStyleMod } from './filterTypeStyleMod.enum';

export class FilterStyleModDto {
  @ApiProperty({
    description: 'Ids de temporadas comerciales',
    example: '',
    isArray: true,
  })
  seasons: number[];
  @ApiProperty({
    description: 'Ids de marcas',
    example: '',
    isArray: true,
  })
  brands: number[];
  @ApiProperty({
    description: 'Ids de categorias',
    example: '',
    isArray: true,
  })
  categories: number[];
  @ApiProperty({
    description: 'Ids de departamentos',
    example: '',
    isArray: true,
  })
  departments: number[];
  @ApiProperty({
    description: 'Ids de estilos',
    example: '',
    isArray: true,
  })
  styles: number[];
  @ApiProperty({
    description: 'Tipo de filtro',
    example: '',
    isArray: true,
  })
  type: FilterTypeStyleMod;
  @ApiProperty({
    description: 'Campos a editar',
    example: '',
    isArray: true,
  })
  fields: DetailsType[];

  @ApiProperty({
    description: 'Ids de usuarios dueños de compras',
    example: [],
    isArray: true,
  })
  users: number[];
  
  @ApiProperty({
    description: 'Mensaje del detalle de la notificacion del cambio en style mod',
    example: ''
  })
  message: string;

  @ApiProperty({
    description: 'Data que almacena los cambios realizados en styleMod en formato crudo',
    type: Object,
    additionalProperties: true

  })
  tableListChanges: [];

  @ApiProperty({
    description: 'Fechas de viaje de compras',
    example: [],
    isArray: true,
  })
  tripDates: string[];
}
