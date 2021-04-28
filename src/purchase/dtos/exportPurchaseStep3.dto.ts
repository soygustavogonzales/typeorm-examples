import { ApiProperty } from '@nestjs/swagger';

export class ExportPurchaseStep3Dto {

  @ApiProperty({
    description: 'Name of file',
  })
  name: string;

  @ApiProperty({
    description: 'Arreglo de objetos con los datos del paso 3',
  })
  data: any[];
}