import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Packaging } from '../../entities/packaging.entity';
import { Repository } from 'typeorm';
import { PackagingDto } from '../dtos/packaging.dto';
import { PackagingEditDto } from '../dtos/packaging-edit.dto';
import { FindPackagingDto } from '../dtos/fingPackaging.dto';
import { PackagingOrderBy } from '../dtos/packagingOrderBy.enum.dto';
import { PackagingResponseDto } from '../dtos/packaging.response.dto';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(Packaging)
    private readonly packagingRepository: Repository<Packaging>,
  ) {}

  async getAll() {
    const packaging = await this.packagingRepository.find({
      where: { active: true },
    });
    return packaging;
  }

  async getAllFilterPackaging(filter: FindPackagingDto, page: number,
    size: number,
    orderBy?: PackagingOrderBy,
    order: 'ASC' | 'DESC' = 'ASC') {

    let query = this.packagingRepository
        .createQueryBuilder('packaging')
        .skip(size * (page - 1))
        .take(size);

    if (filter && JSON.parse(filter.filterActive)) {
        const active = JSON.parse(filter.active);
        query = query.andWhere('packaging.active=:active', { active });
    }
    if (filter && filter.name) {
        query = query.andWhere('packaging.name=:name', { name: filter.name });
    }
    if (filter.ids) {
        const ids= filter.ids.split(',').map((i) => parseInt(i, null));
        query = query.andWhereInIds(ids);
    }
    if (orderBy) {
        switch (orderBy) {
            case PackagingOrderBy.name:
                query.addOrderBy('packaging.name', order);
                break;
            default:
                break;
        }
    }
    const packaging = await query.getManyAndCount();
    const result = new PackagingResponseDto(packaging[1], size);
    result.size = packaging.length;
    result.items = packaging[0];
    return result;
  }

  async getAllFilter() {
    const packaging = await this.packagingRepository.find();
    return packaging;
  }

  async getPackaging(id: number): Promise<PackagingEditDto> {
    const response = await this.packagingRepository.findOne(id)
    return response
  }

  async editPackaging(updateDto: PackagingEditDto) {
    const packaging = await this.packagingRepository.findOne(updateDto.id);
    if (!packaging) { throw new BadRequestException('Packaging methods no existe'); }
    try {
        await this.packagingRepository.update(updateDto.id, updateDto);
        return updateDto.id;
    } catch (error) {
        console.log(error)
        throw new BadRequestException('Error en request');
    }
  }

  async updateById(updateDto: PackagingDto) {
    const packaging = await this.packagingRepository.findOne(updateDto.id);
    if (packaging) {
      packaging.active = updateDto.active;
      await this.packagingRepository.save(packaging);
    }
  }
}
