import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiSecurity, ApiTags, ApiBody } from '@nestjs/swagger';
import { DateRangeDto } from '../shared/dtos/dateRange.dto';
import { ResponseApi } from '../shared/dtos/responseApi.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { ComexService } from './service/comex.service';

@Controller('comex')
@ApiTags('Comex')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ComexController {
    constructor(private comexService: ComexService) { }

    @Post()
    @ApiOkResponse({
        description: 'Servicio para generar Reporte de Compras para COMEX',
    })
    @ApiBody({ type: DateRangeDto })
    async getComexPurchaseReport(@Body() range: DateRangeDto): Promise<ResponseApi<boolean>> {
        this.comexService.generateComexPurchaseReport(range);
        return {status: 200, data: true};
    }
}