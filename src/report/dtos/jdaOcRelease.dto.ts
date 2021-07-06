import { ApiProperty } from '@nestjs/swagger';
import { DateRangeDto } from '../../shared/dtos/dateRange.dto';


export class JdaOcReleaseDto {
  @ApiProperty({
    description: 'Id de la subscription al reporte',
    example: '036e4e04-10e6-4cf5-a830-084033aaa751',
  })
  subscriptionId: string;

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
    description: 'Rango de fechas de liberación de ordenes de compras',
    example: {},
    isArray: false,
  })
  range: DateRangeDto;

  @ApiProperty({
    description: 'Ids de los usuarios',
    example: [],
    isArray: true,
  })
  users: number[];
}
