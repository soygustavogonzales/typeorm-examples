import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString } from 'class-validator';

export class FindProviderDto {
  @ApiProperty({
    description: 'Ids Proveedor',
    example: '1,2,3',
    required: false,
  })
  @IsOptional()
  @IsString()
  ids?: string;

  @ApiProperty({
    description: 'Nombre proveedor',
    example: 'FANCY STYLES LIMITED',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Tipo',
    example: 'CBO',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Code',
    example: 'FAS',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Codido JDA',
    example: '34505',
    required: false,
  })
  @IsString()
  @IsOptional()
  codeJda?: string;

  @ApiProperty({
    description: 'Condiciones de pago',
    example: 'LC AT SIGHT',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentTerm1?: string;

  @ApiProperty({
    description: 'Plazos de pago',
    example: 'AT SIGHT',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentTerm2?: string;

  @ApiProperty({
    description: 'Direccion',
    example: 'CHANDRAMALLIKA',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Email',
    example: 'mohiuddin@envoy-group.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Filter',
    example: 'true',
    required: false,
  })
  @IsBooleanString()
  @IsOptional()
  filterActive?: string;
}
