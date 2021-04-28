import { Controller, Logger, Get, Param, Post, ValidationPipe, UsePipes, Body, Put, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { SeasonStickerService } from './service/season-sticker.service';
import { SeasonStickerDto } from './dtos/seasonSticker.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FindStickerDto } from './dtos/findSticker.dto';
import { StickerOrderBy } from './dtos/stickerOrderBy.enum.dto';

@Controller('sticker')
@ApiTags('Sticker')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class SeasonStickerController {
    // Create a logger instance
    private logger = new Logger('SeasonStickerController');

    constructor(private stickerService: SeasonStickerService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Season Stickers',
    })
    async get() {
        return await this.stickerService.getAll();
    }

    @Get('/filterSticker')
    @ApiQuery({
        name: 'orderBy',
        enum: ['Name', 'None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener stickers',
    })
    async getFilterSticker(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindStickerDto,
        @Query('orderBy') orderBy?: StickerOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.stickerService.getAllFilterSticker(filter, page,
            size,
            orderBy,
            order);
    }

    @Get('/:id')
    @ApiBody({type: SeasonStickerDto})
    @ApiOkResponse({
        description: 'Servicio para obtener un Sticker',
    })
    async getSticker(@Param('id') id) {
        return await this.stickerService.getSticker(id);
    }

    @Post()
    @ApiBody({type: SeasonStickerDto})
    @ApiOkResponse({
        description: 'Servicio para crear Sticker',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() createStickerDto: SeasonStickerDto) {
        const response = await this.stickerService.create(createStickerDto);
        return response;
    }

    @Put('upload')
    @ApiBody({ type: SeasonStickerDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar un Sticker',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: SeasonStickerDto) {
        const response = await this.stickerService.update(updateDto);
        return response;
    }

    @Put()
    @ApiBody({ type: SeasonStickerDto })
    @ApiOkResponse({
        description: 'Servicio para desactivar un Sticker',
    })
    @UsePipes(ValidationPipe)
    async updateActive(@Body() deleteDto: SeasonStickerDto): Promise<any> {
      const response = await this.stickerService.deleteById(deleteDto);
      return response
    }
}
