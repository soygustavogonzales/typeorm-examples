import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, Validator, IsBoolean } from 'class-validator';
import { isBoolean } from 'util';

export class FindSizeDto {
  @ApiProperty({
    description: 'Ids tallas',
    example: '1,2,3',
    required: false,
  })
  @IsOptional()
  @IsString()
  ids?: string;

  @ApiProperty({
    description: 'Talla',
    example: '28-30-32-34-36',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Code',
    example: 'M115-M125-M135-M145-M155',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Active',
    example: 'true',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: string;

  @ApiProperty({
    description: 'Filter',
    example: 'true',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  filterActive?: string;
  

}
