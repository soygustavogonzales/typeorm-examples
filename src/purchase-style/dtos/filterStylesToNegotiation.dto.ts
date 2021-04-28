import { ApiProperty } from '@nestjs/swagger';
import { StatusPurchaseColorEnum } from '../../shared/enums/statusPurchaseColor.enum';

export class FilterStylesToNegotiationDto {
  @ApiProperty({
    description: 'Ids de compras seleccionadas',
    example: '1,2,3',
    isArray: true,
  })
  purchaseIds: string;

  @ApiProperty({
    description: 'Status',
    example: [3, 4],
    isArray: true,
  })
  status: StatusPurchaseColorEnum[];

  @ApiProperty({
    description: 'Departments',
    example: [1, 2, 3],
    isArray: true,
  })
  departments: number[];

  @ApiProperty({
    description: 'SubDepartments',
    example: [1, 2, 3],
    isArray: true,
  })
  subDepartments: number[];

  @ApiProperty({
    description: 'ClassTypes',
    example: [1, 2, 3],
    isArray: true,
  })
  classTypes: number[];

  @ApiProperty({
    description: 'Brands',
    example: [1, 2, 3],
    isArray: true,
  })
  brands: number[];

  @ApiProperty({
    description: 'Categories',
    example: [1, 2, 3],
    isArray: true,
  })
  categories: number[];

  @ApiProperty({
    description: 'Codigos referenciales',
    example: ['602BRAABINV21-211', '601BOABINV21-123'],
    isArray: true,
  })
  referentialsCodes: string[];
}
