import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FilterImportDto } from '../dtos/filterImportFactor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImportFactor } from '../../../entities/importFactor.entity';
import { Repository } from 'typeorm';
import { ImportFactorDto } from '../dtos/importFactor.dto';
import * as _ from 'lodash';
import { StyleProxyService } from '../../../external-services/style-proxy/style-proxy.service';
import { DestinyCountry } from '../../../entities/destinyCountry.entity';
import { OriginCountry } from '../../../entities/originCountry.entity';
import { Shipmethod } from '../../../entities/shipmethod.entity';

@Injectable()
export class ImportFactorService {

    // Create a logger instance
    private logger = new Logger('ImportFactorService');

    constructor(
        @InjectRepository(ImportFactor)
        private readonly importFactorRepository: Repository<ImportFactor>,
        private externalStyleService: StyleProxyService,
    ) { }

    async getAllByDestinyAndOrigin(dto: FilterImportDto) {
        const { originId, destinyId } = dto;
        const factors = await this.importFactorRepository.find({ where: { destinyCountry: { id: destinyId }, originCountry: { id: originId } }, relations: ['shipmethod'] });
        const group = _.groupBy(factors, 'departmentId');
        const departments = await this.externalStyleService.getDepartmentDataByIds(Object.keys(group).map(id => parseInt(id, null)));
        const result = [];
        for (const department of Object.keys(group)) {
            const departmentInfo = departments.find(d => d.id === parseInt(department, null));
            const departmentIF = { departmentId: parseInt(department, null), departmentCode: departmentInfo?.codeChile, departmentName: departmentInfo?.name, factors: [] };
            departmentIF.factors = group[department].map(factor => ({ id: factor.id, shipmethodId: factor.shipmethod.id, shipmethod: factor.shipmethod.name, factor: factor.factor, active: factor.active }));
            result.push(departmentIF);
        }

        return result;
    }

    async getByDestinyAndOriginAndDepartment(dtos: Array<{ destinyId, originId, departmentId, shipmethodId }>) {
        const resultFactors: ImportFactor[] = [];
        for (const dto of dtos) {
            const { originId, destinyId, departmentId, shipmethodId } = dto;
            const factor = await this.importFactorRepository.findOne({ where: { destinyCountry: { id: destinyId }, originCountry: { id: originId }, departmentId, shipmethod: { id: shipmethodId } }, relations: ['destinyCountry', 'originCountry', 'shipmethod'] });
            if(factor){
                resultFactors.push(factor);
            }
        }
        return resultFactors;
    }

    async create(dtos: ImportFactorDto[]): Promise<ImportFactor[]> {
        const response = [];
        for (const dto of dtos) {
            const { id, destinyCountryId, originCountryId, shipmethodId, factor, departmentId, active } = dto;

            if (id && id !== -1) {
                const factorEntity = await this.importFactorRepository.findOne(id, { relations: ['originCountry', 'destinyCountry', 'shipmethod'] });
                if (factorEntity) {
                    factorEntity.factor = factor;
                    factorEntity.active = active;
                    factorEntity.departmentId = departmentId;

                    if (factorEntity.destinyCountry.id !== destinyCountryId) {
                        factorEntity.destinyCountry = new DestinyCountry();
                        factorEntity.destinyCountry.id = destinyCountryId;
                    }
                    if (factorEntity.originCountry.id !== originCountryId) {
                        factorEntity.originCountry = new OriginCountry();
                        factorEntity.originCountry.id = originCountryId;
                    }
                    if (factorEntity.shipmethod.id !== shipmethodId) {
                        factorEntity.shipmethod = new Shipmethod();
                        factorEntity.shipmethod.id = shipmethodId;
                    }
                    await this.importFactorRepository.save(factorEntity);
                    response.push(factorEntity);
                }
                throw new BadRequestException('Entity not found');
            } else {
                const factorEntityFilter = await this.importFactorRepository.findOne({ where: { originCountry: { id: originCountryId }, destinyCountry: { id: destinyCountryId }, shipmethod: { id: shipmethodId }, departmentId }, relations: ['originCountry', 'destinyCountry', 'shipmethod'] });

                if (factorEntityFilter) {
                    factorEntityFilter.active = false;
                    await this.importFactorRepository.save(factorEntityFilter);
                }

                const newImportFactorEntity = new ImportFactor();
                newImportFactorEntity.factor = factor;
                newImportFactorEntity.active = active;
                newImportFactorEntity.departmentId = departmentId;

                newImportFactorEntity.destinyCountry = new DestinyCountry();
                newImportFactorEntity.destinyCountry.id = destinyCountryId;
                newImportFactorEntity.originCountry = new OriginCountry();
                newImportFactorEntity.originCountry.id = originCountryId;
                newImportFactorEntity.shipmethod = new Shipmethod();
                newImportFactorEntity.shipmethod.id = shipmethodId;

                await this.importFactorRepository.save(newImportFactorEntity);
                response.push(newImportFactorEntity);
            }
        }
        return response;

    }

    // TODO DELETE
    // TODO GET BY ID
}
