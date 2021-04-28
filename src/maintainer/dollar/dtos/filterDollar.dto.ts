import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, Validator } from 'class-validator';

export class FilterDollarDto {
  @ApiProperty({
    description: 'Id del país Destino',
    example: 1,
    required: false,
  })
  @IsOptional()
  destinyId: number;

  @ApiProperty({
    description: 'Id de la Temporada Comercial',
    example: 1,
    required: false,
  })
  @IsOptional()
  seasonId: number;

  
}
