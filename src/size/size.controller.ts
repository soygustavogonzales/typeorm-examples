import { Controller, Logger, Get, Query, Put, UsePipes, ValidationPipe, Body, BadRequestException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiQuery, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { SizeService } from './service/size.service';
import { UpdateOrCreateSizeDto } from './dto/updateOrCreateSize.dto';
import { Size } from '../entities/size.entity';
import { ResponseApi } from '../shared/dtos/responseApi.dto';
import { SizeOrderBy } from './dto/sizeOrderBy.enum';
import { FindSizeDto } from './dto/findSize.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('size')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
@ApiTags('Size')
export class SizeController {
    // Create a logger instance
    private logger = new Logger('SizeController');

    constructor(private sizeService: SizeService) {
    }

    @Get()
    @ApiQuery({
        name: 'orderBy',
        enum: [
            'Code',
            'Size',
            'None',
        ],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener Tallas',
    })
    async get(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindSizeDto,
        @Query('orderBy') orderBy?: SizeOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.sizeService.getAll(filter, page,
            size,
            orderBy,
            order);
    }

    @Post()
    @ApiBody({ type: UpdateOrCreateSizeDto })
    @ApiOkResponse({
        description: 'Servicio para crear las tallas',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() dto: UpdateOrCreateSizeDto): Promise<ResponseApi<Size>> {
        const response = await this.sizeService.createOrUpdate(dto);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Ha ocurrido un error, no se ha encontrado una talla con el id provisto');
        }
    }

    @Get('/:id')
    @ApiOkResponse({
        description: 'Servicio para obtener una Talla',
    })
    async getById(@Param('id') id) {
        const response = await this.sizeService.get(id);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Ha ocurrido un error, no se ha encontrado una talla con el id provisto');
        }
    }
    @Get('/jda/all')
    @ApiOkResponse({
        description: 'Servicio para obtener Tallas JDA',
    })
    async getAllJda() {
        const response = await this.sizeService.getAllJda();
        return response;
    }
}
