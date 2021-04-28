import { Controller, Logger, Get, Query, BadRequestException, Post, UsePipes, ValidationPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { DollarService } from './service/dollar.service';
import { FilterDollarDto } from './dtos/filterDollar.dto';
import { ResponseApi } from '../../purchase/dtos/responseApi.entity';
import { DollarChange } from '../../entities/dollarChange.entity';
import { DollarChangeDto } from './dtos/dollarChange.dto';
import { ComposeGuard } from '../../shared/guards/auth.guard';
@Controller('dollar')
@ApiTags('Dollar')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class DollarController {
    // Create a logger instance
    private logger = new Logger('DollarController');

    constructor(private dollarService: DollarService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Precio del Dollar según la temporada',
    })
    async get(@Query() filter: FilterDollarDto): Promise<ResponseApi<number>> {
        const responseDollarChange = await this.dollarService.getBySeasonAndDestinyCountry(filter);
        if (responseDollarChange) {
            return { status: 200, data: responseDollarChange };
        } else {
            throw new BadRequestException('Cambio Dollar no encontrado');
        }
    }

    @Get('all')
    @ApiOkResponse({
        description: 'Servicio para obtener Precio del Dollar según la temporada',
    })
    @ApiQuery({ name: 'seasonId', type: 'number' })
    async getAll(@Query() params: any): Promise<ResponseApi<DollarChange[]>> {
        const { seasonId } = params;
        const responseDollarChange = await this.dollarService.getBySeason([seasonId]);
        if (responseDollarChange) {
            return { status: 200, data: responseDollarChange };
        } else {
            throw new BadRequestException('Cambio Dollar no encontrado');
        }
    }

    @Post()
    @ApiBody({ type: DollarChangeDto })
    @ApiOkResponse({
        description: 'Servicio para crear Factor de Importacion',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() dollarChangeDto: DollarChangeDto): Promise<ResponseApi<DollarChange>> {
        const response = await this.dollarService.create(dollarChangeDto);
        if (response) {
            return { status: 200, data: response };
        } else {
            throw new BadRequestException('Ha ocurrido un error, no se ha encontrado un tipo de cambio con el id provisto');
        }
    }
}
