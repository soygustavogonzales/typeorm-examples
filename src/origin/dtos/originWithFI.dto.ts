import { ApiProperty } from '@nestjs/swagger';
import { OriginCountry } from '../../entities/originCountry.entity';
import { Shipmethod } from '../../entities/shipmethod.entity';
import { ImportFactor } from '../../entities/importFactor.entity';
import { ImportFactorDto } from './importFactor.dto';

export class OriginWithFIDto {
  @ApiProperty({
    description: 'Id del país Origen',
    example: 1,
    required: false,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del país de Origen',
    example: 1,
    required: false,
  })
  name: string;

  @ApiProperty({
    description: 'Nombre corto del país de Origen',
    example: 1,
    required: false,
  })
  shortName: string;

  @ApiProperty({
    description: 'Factor de importación del país de Origen',
    example: 1,
    required: false,
  })
  importFactors: ImportFactorDto[];

  @ApiProperty({
    description: 'Método de entrega',
    example: 1,
    required: false,
  })
  shipmethod: Shipmethod;


  /**
   *
   */
  constructor(data: OriginCountry, importFactors: ImportFactor[]) {
    this.id = data.id;
    this.name = data.name;
    this.shortName = data.shortName;
    this.importFactors = importFactors?.map(f => new ImportFactorDto(f));
  }
}
