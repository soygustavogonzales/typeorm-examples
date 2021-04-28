import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OriginCountry } from '../../entities/originCountry.entity';
import { OriginWithFIDto } from '../dtos/originWithFI.dto';
import { ImportFactor } from '../../entities/importFactor.entity';

@Injectable()
export class OriginService {
    // Create a logger instance
    private logger = new Logger('OriginService');

    constructor(
        @InjectRepository(OriginCountry)
        private readonly originRepository: Repository<OriginCountry>,
        @InjectRepository(ImportFactor)
        private readonly importFactorRepository: Repository<ImportFactor>,
    ) { }

    async getAll(ids: number[] = []) {
        if (ids.length > 0) {
            const profiles = await this.originRepository.findByIds(ids);
            return profiles;
        } else {
            const origins = await this.originRepository.find();
            return origins;
        }
    }

    async getAllWithFI(departmentsId: number[], destinyCountryId: number) {
        const origins = await this.originRepository.find();
        const originsDtoWithFI: OriginWithFIDto[] = [];
        for (const origin of origins) {
            const importFactors:ImportFactor[] = [];
            for (const departmentId of departmentsId) {
                const importFactor = await this.importFactorRepository.find({ relations: ['shipmethod'], where: { originCountry: { id: origin.id }, departmentId, destinyCountry: { id: destinyCountryId } } })
                importFactor.map(imp => importFactors.push(imp));
            }
            originsDtoWithFI.push(new OriginWithFIDto(origin, importFactors));
        }
        return originsDtoWithFI;
    }

    async getById(id) {
        return await this.originRepository.findOne(id);
    }

    async getByShortName(shortName: string): Promise<OriginCountry> {
        return await this.originRepository.findOne({ shortName });
    }
}
