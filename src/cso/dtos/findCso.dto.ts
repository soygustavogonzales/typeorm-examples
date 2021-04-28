import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class FindCsoDto {
  @ApiProperty({
    description: 'Ids temporada',
    example: '1,2,3',
    required: false,
  })
  @IsOptional()
  @IsString()
  ids: string;

  @ApiProperty({
    description: 'Nombre temporada',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Active',
    example: 'true',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active: string;

  @ApiProperty({
    description: 'Filter',
    example: 'true',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  filterActive: string;
}