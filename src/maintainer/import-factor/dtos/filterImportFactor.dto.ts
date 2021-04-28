import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, Validator } from 'class-validator';

export class FilterImportDto {
  @ApiProperty({
    description: 'Id del país Destino',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  destinyId: number;

  @ApiProperty({
    description: 'Id del pais de Origen',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  originId: number;

  
}
