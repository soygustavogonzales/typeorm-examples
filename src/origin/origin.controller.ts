import { Controller, Logger, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { OriginService } from './service/origin.service';
import { OriginCountry } from '../entities/originCountry.entity';
import { ComposeGuard } from '../shared/guards/auth.guard';

@Controller('origin')
@ApiTags('Origin')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class OriginController {

    // Create a logger instance
    private logger = new Logger('OriginController');

    constructor( private originService: OriginService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Paises de Origen',
    })
    async get() {
        return await this.originService.getAll();
    }

    @Get('withFi/:department/:destinyCountry')
    @ApiParam({ name: 'department', type: String })
    @ApiParam({ name: 'destinyCountry', type: String })
    @ApiOkResponse({
        description: 'Servicio para obtener Paises de Origen con Factor de Importacion',
    })
    async getWithFI(@Param('department') department, @Param('destinyCountry') destinyCountry) {
        const departmentsId: number[] = department.split(',');
        const destinyCountryId = parseInt(destinyCountry, null);
        return await this.originService.getAllWithFI(departmentsId, destinyCountryId);
    }

    @Get(':shortName')
    @ApiParam({ name: 'shortName', type: String })
    @ApiOkResponse({
        description: 'Servicio para obtener Pais de Origen por su Short Name',
    })
    async getByShortName(@Param('shortName') shortName): Promise<OriginCountry> {
        return await this.originService.getByShortName(shortName);
    }
}
