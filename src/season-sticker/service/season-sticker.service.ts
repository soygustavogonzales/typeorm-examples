import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeasonSticker } from '../../entities/seasonSticker.entity';
import { Repository } from 'typeorm';
import { SeasonStickerDto } from '../dtos/seasonSticker.dto';
import { StickerOrderBy } from '../dtos/stickerOrderBy.enum.dto';
import { StickerResponseDto } from '../dtos/sticker.response.dto';
import { FindStickerDto } from '../dtos/findSticker.dto';

@Injectable()
export class SeasonStickerService {
    // Create a logger instance
    private logger = new Logger('SeasonStickerService');

    constructor(
        @InjectRepository(SeasonSticker)
        private readonly stickerRepository: Repository<SeasonSticker>,
    ) { }

    async getAll() {
        const stickers = await this.stickerRepository.find({ where: { active: true } });
        return stickers;
    }

    async getAllFilterSticker(filter: FindStickerDto, page: number,
        size: number,
        orderBy?: StickerOrderBy,
        order: 'ASC' | 'DESC' = 'ASC') {
    
        let query = this.stickerRepository
            .createQueryBuilder('sticker')
            .skip(size * (page - 1))
            .take(size);
    
        if (filter && JSON.parse(filter.filterActive)) {
            const active = JSON.parse(filter.active);
            query = query.andWhere('sticker.active=:active', { active });
        }
        if (filter && filter.name) {
            query = query.andWhere('LOWER(sticker.name) LIKE :name', { name: `%${filter.name.toLowerCase()}%` });
        }
        if (filter.ids) {
            const ids= filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (orderBy) {
            switch (orderBy) {
                case StickerOrderBy.name:
                    query.addOrderBy('sticker.name', order);
                    break;
                default:
                    break;
            }
        }
        const sticker = await query.getManyAndCount();
        const result = new StickerResponseDto(sticker[1], size);
        result.size = sticker.length;
        result.items = sticker[0];
        return result;
      }

    async getSticker(id: number): Promise<SeasonStickerDto> {
        const response = await this.stickerRepository.findOne(id)
        return response
    }

    async create(createDto: SeasonStickerDto): Promise<SeasonSticker> {
        const newSticker = new SeasonStickerDto();
        newSticker.active = true;
        Object.assign(newSticker, createDto);
        const response = await this.stickerRepository.save(newSticker);
        return response;
    }

    async update(updateDto: SeasonStickerDto) {
        const stycker = await this.stickerRepository.findOne(updateDto.id);
        if (!stycker) { throw new BadRequestException('Stycker no existe'); }
        try {
            await this.stickerRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error en request');
        }
    }

    async deleteById(updateDto: SeasonStickerDto) {
        await this.stickerRepository.findOne(updateDto.id);
        if (updateDto) {
            updateDto.active = false;
            await this.stickerRepository.save(updateDto);
        }
    }  
}
