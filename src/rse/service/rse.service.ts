import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rse } from '../../entities/rse.entity';
import { Repository } from 'typeorm';
import { RseDto } from '../dtos/rse.dto';
import { FindRseDto } from '../dtos/findRse.dto';
import { RseOrderBy } from '../dtos/rseOrderBy.enum.dto';
import { RseResponseDto } from '../dtos/rse.response.dto';
@Injectable()
export class RseService {
    // Create a logger instance
    private logger = new Logger('RseService');

    constructor(
        @InjectRepository(Rse)
        private readonly rseRepository: Repository<Rse>,
    ) { }

    async getAll() {
        const rses = await this.rseRepository.find({ where: { active: true } });
        return rses;
    }

    async getAllFilterRse(filter: FindRseDto,
                          page: number,
                          size: number,
                          orderBy?: RseOrderBy,
                          order: 'ASC' | 'DESC' = 'ASC') {

        let query = this.rseRepository
            .createQueryBuilder('rse')
            .skip(size * (page - 1))
            .take(size);

        if (filter && JSON.parse(filter.filterActive)) {
            const active = JSON.parse(filter.active);
            query = query.andWhere('rse.active=:active', { active });
        }
        if (filter && filter.name) {
            query = query.andWhere('LOWER(rse.name) LIKE :name', { name: `%${filter.name.toLowerCase()}%` });
        }
        if (filter.ids) {
            const ids = filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (orderBy) {
            switch (orderBy) {
                case RseOrderBy.name:
                    query.addOrderBy('rse.name', order);
                    break;
                default:
                    break;
            }
        }
        const rse = await query.getManyAndCount();
        const result = new RseResponseDto(rse[1], size);
        result.size = rse.length;
        result.items = rse[0];
        return result;
      }

    async getRse(id: number): Promise<RseDto> {
        const response = await this.rseRepository.findOne(id)
        return response
    }

    async create(createDto: RseDto): Promise<Rse> {
        const newRse = new RseDto();
        newRse.active = true;
        Object.assign(newRse, createDto);
        const response = await this.rseRepository.save(newRse);
        return response;
    }

    async update(updateDto: RseDto) {
        const rse = await this.rseRepository.findOne(updateDto.id);
        if (!rse) { throw new BadRequestException('RSE no existe'); }
        try {
            await this.rseRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error en request');
        }
    }

    async deleteById(updateDto: RseDto) {
        await this.rseRepository.findOne(updateDto.id);
        if (updateDto) {
            updateDto.active = false;
            await this.rseRepository.save(updateDto);
        }
    }
}
