import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, Validator } from 'class-validator';

export class FilterDto {
  @ApiProperty({
    description: 'Id de la Division',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  divisionId: number;

  @ApiProperty({
    description: 'Id de la Temporada Comercial',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  seasonId: number;

  
}
