import { Injectable, Logger } from '@nestjs/common';
import { FilterDollarDto } from '../dtos/filterDollar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DollarChange } from '../../../entities/dollarChange.entity';
import { Repository, In } from 'typeorm';
import { DollarChangeDto } from '../dtos/dollarChange.dto';
import { DestinyCountry } from '../../../entities/destinyCountry.entity';
import { SeasonCommercial } from '../../../entities/seasonCommercial.entity';

@Injectable()
export class DollarService {

    // Create a logger instance
    private logger = new Logger('OriginService');

    constructor(
        @InjectRepository(DollarChange)
        private readonly dollarChangeRepository: Repository<DollarChange>,
    ) { }

    async getBySeasonAndDestinyCountry(filter: FilterDollarDto): Promise<number> {
        const destinyId = parseInt(filter.destinyId.toString(), null);
        const seasonId = parseInt(filter.seasonId.toString(), null);
        const dollarsActive = await this.dollarChangeRepository.findOne({ select: ['value'], where: { destinyCountry: { id: destinyId }, seasonCommercial: { id: seasonId }, active: true } });
        return dollarsActive?.value || null;
    }


    async getBySeason(seasonId: number[]): Promise<DollarChange[]> {
        const dollars = await this.dollarChangeRepository.find({ select: ['value', 'id'], relations: ['destinyCountry', 'seasonCommercial'], where: { seasonCommercial: { id: In(seasonId) }, active: true } });
        return dollars;
    }

    async create(dollarChangeDto: DollarChangeDto) {
        const { id, destinyCountryId, seasonId, changeValue } = dollarChangeDto;
        if (id !== -1) {
            const dollarChange = await this.dollarChangeRepository.findOne(id, { relations: ['destinyCountry', 'seasonCommercial'] });
            if (dollarChange) {
                if (dollarChange.destinyCountry.id !== destinyCountryId) {
                    dollarChange.destinyCountry = new DestinyCountry();
                    dollarChange.destinyCountry.id = destinyCountryId;
                }
                dollarChange.value = changeValue;
                await this.dollarChangeRepository.save(dollarChange);
                return dollarChange;
            }
            return null;
        } else {
            const dollarChangeDestiny = await this.dollarChangeRepository.findOne({ where: { active: true, destinyCountry: { id: destinyCountryId }, seasonCommercial: { id: seasonId }, relations: ['destinyCountry', 'seasonCommercial'] } });
            if (dollarChangeDestiny) {
                dollarChangeDestiny.active = false;
                await this.dollarChangeRepository.save(dollarChangeDestiny);
            }
            const newChange = new DollarChange();
            newChange.destinyCountry = new DestinyCountry();
            newChange.destinyCountry.id = destinyCountryId;
            newChange.seasonCommercial = new SeasonCommercial();
            newChange.seasonCommercial.id = seasonId;
            newChange.value = changeValue;
            newChange.active = true;
            await this.dollarChangeRepository.save(newChange);
            return newChange;
        }

    }
}
