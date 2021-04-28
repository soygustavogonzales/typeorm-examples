import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseFilterDto } from '../../shared/dtos/response.filter.dto';
import { SeasonSticker } from '../../entities/seasonSticker.entity';

export class StickerResponseDto extends ResponseFilterDto<SeasonSticker[]> {
  @ApiProperty({ description: 'Listado de temporadas', type: SeasonSticker, isArray: true })
  @IsArray()
  items: SeasonSticker[];
}