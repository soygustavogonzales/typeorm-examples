import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shipmethod } from '../../entities/shipmethod.entity';
import { Repository } from 'typeorm';
import { ShipmethodDto } from '../dtos/shipmethod.dto';
import { ShipmethodEditDto } from '../dtos/shipmethod-edit.dto';
import { FindShipMethodDto } from '../dtos/finShipMethod.dto';
import { ShipMethodOrderBy } from '../dtos/shipMethodOrderBy.enum';
import { ShipMethodResponseDto } from '../dtos/shipmethod.response.dto';

@Injectable()
export class ShipmethodService {
  constructor(
    @InjectRepository(Shipmethod)
    private readonly shipmethodRepository: Repository<Shipmethod>,
  ) {}

  async getAll() {
    const shipmethod = await this.shipmethodRepository.find({
      where: { active: true },
    });
    return shipmethod;
  }

  async getAllFilterShipMethod(filter: FindShipMethodDto, page: number,
    size: number,
    orderBy?: ShipMethodOrderBy,
    order: 'ASC' | 'DESC' = 'ASC') {

    let query = this.shipmethodRepository
        .createQueryBuilder('shipmethod')
        .skip(size * (page - 1))
        .take(size);

    if (filter && JSON.parse(filter.filterActive)) {
        const active = JSON.parse(filter.active);
        query = query.andWhere('shipmethod.active=:active', { active });
    }
    if (filter && filter.name) {
        query = query.andWhere('shipmethod.name=:name', { name: filter.name });
    }
    if (filter.ids) {
        const ids= filter.ids.split(',').map((i) => parseInt(i, null));
        query = query.andWhereInIds(ids);
    }
    if (orderBy) {
        switch (orderBy) {
            case ShipMethodOrderBy.name:
                query.addOrderBy('shipmethod.name', order);
                break;
            default:
                break;
        }
    }
    const shipmethod = await query.getManyAndCount();
    const result = new ShipMethodResponseDto(shipmethod[1], size);
    result.size = shipmethod.length;
    result.items = shipmethod[0];
    return result;
  }

  async getAllFilter() {
    const shipmethod = await this.shipmethodRepository.find();
    return shipmethod;
  }

  async getShiping(id: number): Promise<ShipmethodEditDto> {
    const response = await this.shipmethodRepository.findOne(id)
    return response
  }

  async editShiping(updateDto: ShipmethodEditDto) {
    const shipmethod = await this.shipmethodRepository.findOne(updateDto.id);
    if (!shipmethod) { throw new BadRequestException('Shipmethod no existe'); }
    try {
        await this.shipmethodRepository.update(updateDto.id, updateDto);
        return updateDto.id;
    } catch (error) {
        console.log(error)
        throw new BadRequestException('Error en request');
    }
  }

  async updateById(updateDto: ShipmethodDto) {
    const shipmethod = await this.shipmethodRepository.findOne(updateDto.id);
    if (shipmethod) {
      shipmethod.active = updateDto.active;
      await this.shipmethodRepository.save(shipmethod);
    }
  }
}
