import { Controller, Logger, Get, Param, Post, UsePipes, ValidationPipe, Body, Put, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { SegmentService } from './service/segment.service';
import { SegmentDto } from './dtos/segment.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FindSegmentDto } from './dtos/findSegment.dto';
import { SegmentOrderBy } from './dtos/segmentOrderBy.enum.dto';

@Controller('segment')
@ApiTags('Segment')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class SegmentController {
    // Create a logger instance
    private logger = new Logger('SegmentController');

    constructor(private segmentService: SegmentService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Segmentos',
    })
    async get() {
        return await this.segmentService.getAll();
    }

    @Get('/filterSegment')
    @ApiQuery({
        name: 'orderBy',
        enum: ['Name', 'None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener segmentos',
    })
    async getFilterSegment(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindSegmentDto,
        @Query('orderBy') orderBy?: SegmentOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.segmentService.getAllFilterSegment(filter, page,
            size,
            orderBy,
            order);
    }

    @Get('/:id')
    @ApiBody({type: SegmentDto})
    @ApiOkResponse({
        description: 'Servicio para obtener una Segmento',
    })
    async getSegment(@Param('id') id) {
        return await this.segmentService.getSegment(id);
    }

    @Post()
    @ApiBody({type: SegmentDto})
    @ApiOkResponse({
        description: 'Servicio para crear Segmento',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() createSegmentDto: SegmentDto) {
        const response = await this.segmentService.create(createSegmentDto);
        return response;
    }

    @Put('upload')
    @ApiBody({ type: SegmentDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar una Segmento',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: SegmentDto) {
        const response = await this.segmentService.update(updateDto);
        return response;
    }

    @Put()
    @ApiBody({ type: SegmentDto })
    @ApiOkResponse({
        description: 'Servicio para desactivar una Segmento',
    })
    @UsePipes(ValidationPipe)
    async updateActive(@Body() updateDto: SegmentDto) {
        const response = await this.segmentService.deleteById(updateDto);
        return response
    }
}
