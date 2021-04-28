import { ApiProperty } from '@nestjs/swagger';
import { Shipmethod } from '../../entities/shipmethod.entity';
import { ImportFactor } from '../../entities/importFactor.entity';

export class ImportFactorDto {
  @ApiProperty({
    description: 'Id del factor de importación',
    example: 1,
    required: false,
  })
  id: number;

  @ApiProperty({
    description: 'Id del departamento',
    example: 1,
    required: false,
  })
  departmentId: number;

  @ApiProperty({
    description: 'Factor de importación del país de Origen',
    example: 1,
    required: false,
  })
  importFactor: number;

  @ApiProperty({
    description: 'Método de entrega',
    example: 1,
    required: false,
  })
  shipmethod: Shipmethod;

  /**
   *
   */
  constructor(data: ImportFactor) {
    this.id = data.id;
    this.shipmethod = data.shipmethod;
    this.importFactor = data.factor;
    this.departmentId = data.departmentId;
  }
}
