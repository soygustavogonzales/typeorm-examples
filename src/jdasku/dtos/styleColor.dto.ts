import { ApiProperty } from '@nestjs/swagger';

export class StyleColorDto {
  id: number;
  colorId: number;
  colorName: string;
  colorShortName: string;
  colorCode: number;
  colorRgb: string;
  approved: boolean;
}
