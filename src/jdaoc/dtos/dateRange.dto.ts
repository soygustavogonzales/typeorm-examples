import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';


export class DateRangeDto {
  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2021-05-19',
    isArray: false,
  })
  @IsDate()
  @Type(() => Date)
  start: Date;

  @ApiProperty({
    description: 'Fecha fin',
    example: '2021-06-10',
    isArray: false,
  })
  @IsDate()
  @Type(() => Date)
  end: Date;
}
