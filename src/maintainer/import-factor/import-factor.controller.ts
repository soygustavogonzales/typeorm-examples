import { Controller, Logger, Get, Query, BadRequestException, Post, UsePipes, ValidationPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ImportFactorService } from './service/import-factor.service';
import { FilterImportDto } from './dtos/filterImportFactor.dto';
import { ResponseApi } from '../../purchase/dtos/responseApi.entity';
import { ImportFactor } from '../../entities/importFactor.entity';
import { ImportFactorDto } from './dtos/importFactor.dto';
import { ComposeGuard } from '../../shared/guards/auth.guard';

@Controller('import-factor')
@ApiTags('ImportFactor')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class ImportFactorController {
    // Create a logger instance
    private logger = new Logger('ImportFactorController');

    constructor(private importFactorService: ImportFactorService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Factores de Importación',
    })
    async get(@Query() dto: FilterImportDto): Promise<ResponseApi<ImportFactor[]>> {
        const responseImport = await this.importFactorService.getAllByDestinyAndOrigin(dto);
        if (responseImport) {
            return { status: 200, data: responseImport };
        } else {
            throw new BadRequestException('Factore de Importación no encontrados');
        }
    }

    @Post()
    @ApiBody({ type: ImportFactorDto, isArray: true })
    @ApiOkResponse({
        description: 'Servicio para crear Factor de Importacion',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() factorDto: ImportFactorDto[]): Promise<ResponseApi<ImportFactor[]>> {
        const response = await this.importFactorService.create(factorDto);

        return { status: 200, data: response };
    }
}
