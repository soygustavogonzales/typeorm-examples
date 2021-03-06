import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseApi } from '../shared/dtos/responseApi.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { GetUser } from '../shared/jwt/get-user.decorator';
import { JdaOcDto } from './dtos/jdaoc.dto';
import { JdaOcFilterDto } from './dtos/jdaocFilter.dto';
import { JdaOcService } from './service/jdaoc.service';
import { JdaOcSyncService } from './service/jdaocsync.service';

@Controller('jdaoc')
@ApiTags('JdaOc')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class JdaocController {
    constructor(private jdaskusyncService: JdaOcSyncService,
        private jdaocService: JdaOcService) { }

    @Post('jdasync')
    @ApiOkResponse({
        description: 'Servicio para sincronizar OC generados en JDA',
    })
    async jdasync(): Promise<any> {
        return await this.jdaskusyncService.jdasync();
    }

    @Post('jdaocresync/:piName')
    @ApiOkResponse({
        description: 'Servicio para sincronizar de forma completa una PI con JDA, incluido OC que se pudieron haber cancelado',
    })
    async jdaOcResync(@Param('piName') piName: string): Promise<any> {
        return await this.jdaskusyncService.jdaOcResync(piName);
    }

    @Get('jdaoc-numbers')
    @ApiOkResponse({
        description: 'Servicio para obtener los números de ordenes de compra',
    })
    async jdaOcNumbers(): Promise<string[]> {
        return await this.jdaocService.jdaOcNumbers();
    }

    @Get('released-jdaoc-numbers')
    @ApiOkResponse({
        description: 'Servicio para obtener los números de ordenes de compra liberadas',
    })
    async releasedJdaOcNumbers(): Promise<number[]> {
        return await this.jdaocService.releasedJdaOcNumbers();
    }

    @Post('jdaoc-by-filter')
    @ApiOkResponse({
        description: 'Servicio para obtener las ordenes de compra por filtro',
    })
    async jdaOcByFilter(@Body() filter: JdaOcFilterDto): Promise<JdaOcDto[]> {
        return await this.jdaocService.jdaOcByFilter(filter);
    }

    @Post('details')
    @ApiOkResponse({
        description: 'Servicio para descargar los detalles de las ordenes de compra',
    })
    async jdaOcDetails(@Body() ocNumbers: string[]): Promise<ResponseApi<string>> {
        const response = await this.jdaocService.jdaOcDetails(ocNumbers);
        return {status: 200, data: response};
    }

    @Post('detailsB200')
    @ApiOkResponse({
        description: 'Servicio para descargar los detalles de las ordenes de compra con B200',
    })
    async jdaOcDetailsB200(@Body() ocNumbers: string[]): Promise<ResponseApi<string>> {
        const response = await this.jdaocService.jdaOcDetailsB200(ocNumbers);
        return {status: 200, data: response};
    }

    @Post('jdaoc-release')
    @ApiBody({ isArray: true, type: 'string' })
    @ApiOkResponse({
        description: 'Servicio para liberar ordenes de compra',
    })
    async jdaOcRelease(@Body() dto: string[], @GetUser() user): Promise<ResponseApi<number>> {
        const response = await this.jdaocService.jdaOcRelease(dto, user);
        return { status: 200, data: response };
    }
}
