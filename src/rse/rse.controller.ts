import { Controller, Logger, Get, Param, Post, UsePipes, ValidationPipe, Body, Put, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { RseService } from './service/rse.service';
import { RseDto } from './dtos/rse.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { RseOrderBy } from './dtos/rseOrderBy.enum.dto';
import { FindRseDto } from './dtos/findRse.dto';

@Controller('rse')
@ApiTags('Rse')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class RseController {
    // Create a logger instance
    private logger = new Logger('RseController');

    constructor(private rseService: RseService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener RSE',
    })
    async get() {
        return await this.rseService.getAll();
    }

    @Get('/filterRse')
    @ApiQuery({
        name: 'orderBy',
        enum: ['Name', 'None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener temporadas',
    })
    async getFilterSeasonCommercial(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindRseDto,
        @Query('orderBy') orderBy?: RseOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.rseService.getAllFilterRse(filter, page,
            size,
            orderBy,
            order);
    }

    @Get('/:id')
    @ApiBody({type: RseDto})
    @ApiOkResponse({
        description: 'Servicio para obtener un RSE',
    })
    async getCategory(@Param('id') id) {
        return await this.rseService.getRse(id);
    }

    @Post()
    @ApiBody({type: RseDto})
    @ApiOkResponse({
        description: 'Servicio para crear RSE',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() createRseDto: RseDto) {
        const response = await this.rseService.create(createRseDto);
        return response;
    }

    @Put('upload')
    @ApiBody({ type: RseDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar un RSE',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: RseDto) {
        const response = await this.rseService.update(updateDto);
        return response;
    }

    @Put()
    @ApiBody({ type: RseDto })
    @ApiOkResponse({
        description: 'Servicio para desactivar un RSE',
    })
    @UsePipes(ValidationPipe)
    async updateActive(@Body() updateDto: RseDto) {
        const response = await this.rseService.deleteById(updateDto);
        return response
    }
}
