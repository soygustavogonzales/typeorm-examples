import { ApiProperty } from '@nestjs/swagger';
import { DateRangeDto } from '../../shared/dtos/dateRange.dto';


export class JdaOcFilterDto {
  @ApiProperty({
    description: 'Codes de departamentos',
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
