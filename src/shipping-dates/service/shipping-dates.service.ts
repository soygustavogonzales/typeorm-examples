import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingDates } from '../../entities/shippingDates.entity';
import { OriginCountry } from '../../entities/originCountry.entity';
import { SeasonCommercial } from '../../entities/seasonCommercial.entity';
import { Repository, LessThan } from 'typeorm';
import { DeleteShippingDateDto } from '../dto/deleteShippingDate.dto';
import { UpdateShippingDateDto } from '../dto/updateShippingDate.dto';
import { FilterDto } from '../dto/filter.dto';
import { CreateBulkShippingDateDto } from '../dto/createBulkShippingDate.dto';
import { ChildFilterDto } from '../dto/childFilter.dto';
import { ShippingDatesChild } from '../../entities/shippingDatesChild.entity';
import * as _moment from 'moment';
import { ChildUpdateDto } from '../dto/childUpdate.dto';
import { ChildDeleteDto } from '../dto/childDelete.dto';

@Injectable()
export class ShippingDatesService {

    // Create a logger instance
    private logger = new Logger('ShippingDatesService');

    constructor(
        @InjectRepository(ShippingDates)
        private readonly shippingDatesRepository: Repository<ShippingDates>,
        @InjectRepository(OriginCountry)
        private readonly originRepository: Repository<OriginCountry>,
        @InjectRepository(SeasonCommercial)
        private readonly seasonCommercialRepository: Repository<SeasonCommercial>,
        @InjectRepository(ShippingDatesChild)
        private readonly shippingDatesChildRepository: Repository<ShippingDatesChild>,
    ) { }

    async getAll() {
        try {
            return await this.shippingDatesRepository.find();
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async findByUniqueKey(shipDate: ShippingDates) {
        try {
            return await this.shippingDatesRepository.findOne({ where: { divisionId: shipDate.divisionId, seasonCommercialId: shipDate.seasonCommercialId, originCountryId: shipDate.originCountryId, shipping: shipDate.shipping } });
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async create(shipDate: ShippingDates) {
        const origin = await this.originRepository.findOne(shipDate.originCountryId);
        if (!origin) { throw new BadRequestException('Origen no existe'); }
        const season = await this.seasonCommercialRepository.findOne(shipDate.seasonCommercialId);
        if (!season) { throw new BadRequestException('Commercial Season no existe'); }
        try {
            const findShipdate = await this.findByUniqueKey(shipDate);
            if (findShipdate) {
                return findShipdate;
            }
            await this.shippingDatesRepository.save(shipDate);
            return await this.findByUniqueKey(shipDate);
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async updateBulk(shipDateBulk: CreateBulkShippingDateDto) {
        const origin = await this.originRepository.findOne(shipDateBulk.originCountryId);
        if (!origin) { throw new BadRequestException('Origen no existe'); }
        const season = await this.seasonCommercialRepository.findOne(shipDateBulk.seasonCommercialId);
        if (!season) { throw new BadRequestException('Commercial Season no existe'); }
        try {
            let result: ShippingDates[];
            result = await Promise.all(shipDateBulk.shippings.map(async shipRow => {
                let shipDate = new ShippingDates();
                shipDate.divisionId = shipDateBulk.divisionId;
                shipDate.originCountryId = shipDateBulk.originCountryId;
                shipDate.seasonCommercialId = shipDateBulk.seasonCommercialId;
                shipDate.shipping = shipRow.shipping;
                shipDate.date = shipRow.date;
                const findShipdate = await this.findByUniqueKey(shipDate);
                if (findShipdate) {
                    await this.shippingDatesRepository.update(findShipdate.id, shipDate);
                }
                return await this.findByUniqueKey(shipDate);
            }));
            return result;
        } catch (error) {
            this.logger.log(error);
            throw new BadRequestException('Error en request');
        }
    }

    async createBulk(shipDateBulk: CreateBulkShippingDateDto) {
        const origin = await this.originRepository.findOne(shipDateBulk.originCountryId);
        if (!origin) { throw new BadRequestException('Origen no existe'); }
        const season = await this.seasonCommercialRepository.findOne(shipDateBulk.seasonCommercialId);
        if (!season) { throw new BadRequestException('Commercial Season no existe'); }
        try {
            let result: ShippingDates[];
            result = await Promise.all(shipDateBulk.shippings.map(async shipRow => {
                let shipDate = new ShippingDates();
                shipDate.divisionId = shipDateBulk.divisionId;
                shipDate.originCountryId = shipDateBulk.originCountryId;
                shipDate.seasonCommercialId = shipDateBulk.seasonCommercialId;
                shipDate.shipping = shipRow.shipping;
                shipDate.date = shipRow.date;
                const findShipdate = await this.findByUniqueKey(shipDate);
                if (!findShipdate) {
                    await this.shippingDatesRepository.save(shipDate);
                }
                return await this.findByUniqueKey(shipDate);
            }));
            return result;
        } catch (error) {
            this.logger.log(error);
            throw new BadRequestException('Error en request');
        }
    }

    async deleteById(deleteDto: DeleteShippingDateDto) {
        try {
            await this.shippingDatesRepository.delete(deleteDto.id);
            return {links : '/list-date'};
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async deleteByDivisionIdSeasonId(filter: FilterDto) {
        try {
            const origin = await this.originRepository.findOne({where: {shortName: 'CN'}});
            const shippingDates = await this.shippingDatesRepository.find({ where: { divisionId: filter.divisionId, seasonCommercialId: filter.seasonId, originCountryId: origin.id } });
            await Promise.all(shippingDates.map(async shippingRow => {
                await this.shippingDatesRepository.delete(shippingRow.id);
            }));
            const childDates = await this.shippingDatesChildRepository.find({ where: { divisionId: filter.divisionId, seasonCommercialId: filter.seasonId } });
            await this.shippingDatesChildRepository.remove(childDates);
            return {links : '/list-date'};
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async update(updateDto: UpdateShippingDateDto) {
        const origin = await this.originRepository.findOne(updateDto.originCountryId);
        if (!origin) { throw new BadRequestException('Origen no existe'); }
        const season = await this.seasonCommercialRepository.findOne(updateDto.seasonCommercialId);
        if (!season) { throw new BadRequestException('Commercial Season no existe'); }
        try {
            await this.shippingDatesRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    getBySeason(filter: FilterDto) {
        const { seasonId } = filter;
        return this.shippingDatesRepository.find({ where: { seasonCommercialId: seasonId }, order: { shipping: 'ASC'}});
    }

    getByFilter(filter: FilterDto) {
        const { divisionId, seasonId } = filter;
        return this.shippingDatesRepository.find({ where: { divisionId, seasonCommercialId: seasonId }, select: ['id', 'shipping', 'date'], order: { date: 'ASC'} });
    }

    async getChildDatesByFilter(filter: ChildFilterDto): Promise<ShippingDates[]> {
        const calculatedDates: ShippingDates[] = [];
        const childCountries = await this.shippingDatesChildRepository.find({ where: filter });
        await Promise.all(childCountries.map(async childCountry => {
            const shippingDates = await this.shippingDatesRepository.find({where : { divisionId: childCountry.divisionId, seasonCommercialId: childCountry.seasonCommercialId }});
            shippingDates.map(shippDate => {
                calculatedDates.push({ ...shippDate, id: childCountry.id, originCountryId: childCountry.originCountryId, date: _moment(shippDate.date).add(childCountry.days, 'days').toDate() });
            });
        }));
        return calculatedDates;
    }

    async getChildByFilter(filter: ChildFilterDto): Promise<ShippingDatesChild[]> {
        const childCountries = await this.shippingDatesChildRepository.find({ where: filter });
        return childCountries;
    }

    async createChild(shipDateChild: ShippingDatesChild) {
        const origin = await this.originRepository.findOne(shipDateChild.originCountryId);
        if (!origin) { throw new BadRequestException('Origen no existe'); }
        const season = await this.seasonCommercialRepository.findOne(shipDateChild.seasonCommercialId);
        if (!season) { throw new BadRequestException('Commercial Season no existe'); }
        const originCn = await this.originRepository.findOne({where: {shortName: 'CN'}});
        const parentCountry = await this.shippingDatesRepository.findOne({ where: { divisionId: shipDateChild.divisionId, seasonCommercialId: shipDateChild.seasonCommercialId, originCountryId: originCn.id } });
        if (!parentCountry) { throw new BadRequestException('China no está configurado'); }
        try {
            const findShipdate = await this.shippingDatesChildRepository.findOne({ where: { divisionId: shipDateChild.divisionId, seasonCommercialId: shipDateChild.seasonCommercialId, originCountryId: shipDateChild.originCountryId } });
            if (findShipdate) {
                return findShipdate;
            }
            await this.shippingDatesChildRepository.save(shipDateChild);
            return await this.shippingDatesChildRepository.findOne({ where: { divisionId: shipDateChild.divisionId, seasonCommercialId: shipDateChild.seasonCommercialId, originCountryId: shipDateChild.originCountryId } });
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async updateChild(shipDateChild: ChildUpdateDto) {
        try {
            await this.shippingDatesChildRepository.update(shipDateChild.id, shipDateChild);
            return shipDateChild.id;
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }

    async deleteChild(childDeleteDto: ChildDeleteDto): Promise<any> {
        try {
            const findShipdate = await this.shippingDatesChildRepository.findOne({ where: { divisionId: childDeleteDto.divisionId, seasonCommercialId: childDeleteDto.seasonCommercialId, originCountryId: childDeleteDto.originCountryId } });
            await this.shippingDatesChildRepository.delete(findShipdate.id);
            return {links : '/list-date'};
        } catch (error) {
            throw new BadRequestException('Error en request');
        }
    }
}
