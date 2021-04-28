import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Segment } from '../../entities/segment.entity';
import { Repository } from 'typeorm';
import { SegmentDto } from '../dtos/segment.dto';
import { FindSegmentDto } from '../dtos/findSegment.dto';
import { SegmentOrderBy } from '../dtos/segmentOrderBy.enum.dto';
import { SegmentResponseDto } from '../dtos/segment.response.dto';

@Injectable()
export class SegmentService {
    // Create a logger instance
    private logger = new Logger('SegmentService');

    constructor(
        @InjectRepository(Segment)
        private readonly segmentRepository: Repository<Segment>,
    ) { }

    async getAll() {
        const segments = await this.segmentRepository.find({ where: { active: true } });
        return segments;
    }

    async getAllFilterSegment(filter: FindSegmentDto, page: number,
        size: number,
        orderBy?: SegmentOrderBy,
        order: 'ASC' | 'DESC' = 'ASC') {
    
        let query = this.segmentRepository
            .createQueryBuilder('segment')
            .skip(size * (page - 1))
            .take(size);
    
        if (filter && JSON.parse(filter.filterActive)) {
            const active = JSON.parse(filter.active);
            query = query.andWhere('segment.active=:active', { active });
        }
        if (filter && filter.name) {
            query = query.andWhere('segment.name=:name', { name: filter.name });
        }
        if (filter.ids) {
            const ids= filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (orderBy) {
            switch (orderBy) {
                case SegmentOrderBy.name:
                    query.addOrderBy('segment.name', order);
                    break;
                default:
                    break;
            }
        }
        const segment = await query.getManyAndCount();
        const result = new SegmentResponseDto(segment[1], size);
        result.size = segment.length;
        result.items = segment[0];
        return result;
      }

    async getSegment(id: number): Promise<SegmentDto> {
        const response = await this.segmentRepository.findOne(id)
        return response
    }

    async create(createDto: SegmentDto): Promise<Segment> {
        const newSegment = new SegmentDto();
        newSegment.active = true;
        Object.assign(newSegment, createDto);
        const response = await this.segmentRepository.save(newSegment);
        return response;
    }

    async update(updateDto: SegmentDto) {
        const segment = await this.segmentRepository.findOne(updateDto.id);
        if (!segment) { throw new BadRequestException('Segmento no existe'); }
        try {
            await this.segmentRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error en request');
        }
    }

    async deleteById(updateDto: SegmentDto) {
        await this.segmentRepository.findOne(updateDto.id);
        if (updateDto) {
            updateDto.active = false;
            await this.segmentRepository.save(updateDto);
        }
    }
}
