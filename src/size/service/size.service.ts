import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Size } from '../../entities/size.entity';
import { Repository } from 'typeorm';
import { UpdateOrCreateSizeDto } from '../dto/updateOrCreateSize.dto';
import { RatioService } from '../../ratio/service/ratio.service';
import { SizeJda } from '../../entities/sizeJda.entity';
import { SizeOrderBy } from '../dto/sizeOrderBy.enum';
import { SizesResponseDto } from '../dto/size.response.dto';
import { FilterDto } from '../../shipping-dates/dto/filter.dto';
import { FindSizeDto } from '../dto/findSize.dto';

@Injectable()
export class SizeService {




    // Create a logger instance
    private logger = new Logger('SizeService');

    constructor(
        @InjectRepository(Size)
        private readonly sizeRepository: Repository<Size>,
        @InjectRepository(SizeJda)
        private readonly sizeJdaRepository: Repository<SizeJda>,
        private ratioService: RatioService,
    ) { }

    async getAll(filter: FindSizeDto, page: number,
        size: number,
        orderBy?: SizeOrderBy,
        order: 'ASC' | 'DESC' = 'ASC') {

        let query = this.sizeRepository
            .createQueryBuilder('size')
            .skip(size * (page - 1))
            .take(size);
        if (filter && JSON.parse(filter.filterActive)) {
            const active = JSON.parse(filter.active);
            query = query.andWhere('size.active=:active', { active });
        }
        if (filter && filter.code) {
            query = query.andWhere('LOWER(size.code) LIKE :code', { code: `%${filter.code.toLowerCase()}%` });
        }
        if (filter && filter.name) {
            query = query.andWhere('LOWER(size.size) LIKE :size', { size: `%${filter.name.toLowerCase()}%` });
        }
        if (filter.ids) {
            const ids = filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (orderBy) {
            switch (orderBy) {
                case SizeOrderBy.code:
                    query.addOrderBy('size.code', order);
                    break;
                case SizeOrderBy.size:
                    query.addOrderBy('size.size', order);
                    break;
                default:
                    break;
            }
        }
        const sizes = await query.getManyAndCount();
        const result = new SizesResponseDto(sizes[1], size);
        result.size = sizes.length;
        result.items = sizes[0];
        return result;


        // if (filter) {
        //     if (orderBy && orderBy === SizeOrderBy.code) {
        //         return await this.sizeRepository.find({
        //             where: { active }, skip: size * (page - 1), take: size, order: {
        //                 code: order,
        //             },
        //         });
        //     } else if (orderBy && orderBy === SizeOrderBy.size) {
        //         return await this.sizeRepository.find({
        //             where: { active }, skip: size * (page - 1), take: size, order: {
        //                 size: order,
        //             },
        //         });
        //     } else {
        //         return await this.sizeRepository.find({
        //             where: { active }, skip: size * (page - 1), take: size
        //         });
        //     }
        // } else {
        //     return this.sizeRepository.find({ skip: size * (page - 1), take: size });
        // }
    }

    async createOrUpdate(dto: UpdateOrCreateSizeDto) {
        if (dto.id === -1) {
            const entity = new Size();
            entity.active = true;
            entity.code = dto.code;
            entity.size = dto.size;
            await this.sizeRepository.save(entity);
            return entity;
        } else {
            const entity = await this.sizeRepository.findOne(dto.id);
            if (!dto.active && entity) {
                entity.active = false;
                await this.sizeRepository.save(entity);
            } else if (entity) {
                entity.size = dto.size ? dto.size : entity.size;
                entity.code = dto.code ? dto.code : entity.code;
                entity.active = dto.active;
                await this.sizeRepository.save(entity);
            }
            return entity;

        }

    }

    async get(id: any) {
        const entity = await this.sizeRepository.findOne(id);
        if (entity) {
            // const ratios = await this.ratioService.getAll();
            return new UpdateOrCreateSizeDto(entity, []);
        }
        return null;
    }

    async getAllJda() {
        return await this.sizeJdaRepository.find();
    }
}
