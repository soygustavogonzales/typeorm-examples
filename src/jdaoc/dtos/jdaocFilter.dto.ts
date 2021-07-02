import { ApiProperty } from '@nestjs/swagger';
import { DateRangeDto } from './dateRange.dto';


export class JdaOcFilterDto {
  @ApiProperty({
    description: 'Ids de departamentos',
    example: [],
    isArray: true,
  })
  departments: number[];

  @ApiProperty({
    description: 'JdaCodes de proveedores',
    example: [],
    isArray: true,
  })
  providers: string[];

  @ApiProperty({
    description: 'Ids de ordenes de compras',
    example: [],
    isArray: true,
  })
  ocs: number[];
  
  @ApiProperty({
    description: 'Rango de fechas de creación de ordenes de compras',
    example: {},
    isArray: false,
  })
  range: DateRangeDto;
}
