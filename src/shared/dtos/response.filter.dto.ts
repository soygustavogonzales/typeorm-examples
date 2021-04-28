import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export abstract class ResponseFilterDto<T> {
  abstract get items(): T;

  @ApiProperty({ description: 'Total de elementos', example: 100 })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Total de páginas según el tamaño de página', example: 1 })
  @IsNumber()
  pages: number;

  @ApiProperty({ description: 'Elementos encontrados para la página actual', example: 10 })
  @IsNumber()
  size: number;

  constructor(total: number, size: number) {
    this.total = total;
    this.pages = Math.floor(total / size) + (total % size === 0 ? 0 : 1);
  }
}
