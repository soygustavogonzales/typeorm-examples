import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExitPortsDto } from '../dtos/exitports.dto';
import { ExitPortsEditDto } from '../dtos/exitports-edit.dto';
import { ExitPort } from '../../entities/exitPort.entity';
import { FindExitPortsDto } from '../dtos/findExitPorts.dto';
import { ExitPortsOrderBy } from '../dtos/exitPortsOrderBy.enum.dto';
import { ExitPortsResponseDto } from '../dtos/exitports.response.dto';

@Injectable()
export class ExitportsService {
  constructor(
    @InjectRepository(ExitPort)
    private readonly exitportsRepository: Repository<ExitPort>,
  ) {}

  async getAll() {
    const exitports = await this.exitportsRepository.find({
      where: { active: true },
    });
    return exitports;
  }

  async getAllFilter() {
    const exitports = await this.exitportsRepository.find();
    return exitports;
  }

  async getExitPort(id: number): Promise<ExitPortsEditDto> {
    const response = await this.exitportsRepository.findOne(id)
    return response
  }

  async editExitPort(updateDto: ExitPortsEditDto) {
    const exitports = await this.exitportsRepository.findOne(updateDto.id);
    if (!exitports) { throw new BadRequestException('ExitPort no existe'); }
    try {
        await this.exitportsRepository.update(updateDto.id, updateDto);
        return updateDto.id;
    } catch (error) {
        console.log(error)
        throw new BadRequestException('Error en request');
    }
  }

  async updateById(updateDto: ExitPortsDto) {
    const exitports = await this.exitportsRepository.findOne(updateDto.id);
    if (exitports) {
      exitports.active = updateDto.active;
      await this.exitportsRepository.save(exitports);
    }
  }

  async getAllFilterExitPort(
    filter: FindExitPortsDto,
    page: number,
    size: number,
    orderBy?: ExitPortsOrderBy,
    order: 'ASC' | 'DESC' = 'ASC') {

    let query = this.exitportsRepository
        .createQueryBuilder('exitports')
        .skip(size * (page - 1))
        .take(size);

    if (filter && JSON.parse(filter.filterActive)) {
        const active = JSON.parse(filter.filterActive);
        query = query.andWhere('exitports.active=:active', { active });
    }
    if (filter && filter.name) {
        query = query.andWhere('LOWER(exitports.name) LIKE :name', { name: `%${filter.name.toLowerCase()}%` });
    }
    if (filter.ids) {
        const ids = filter.ids.split(',').map((i) => parseInt(i, null));
        query = query.andWhereInIds(ids);
    }
    if (orderBy) {
        switch (orderBy) {
            case ExitPortsOrderBy.name:
                query.addOrderBy('exitports.name', order);
                break;
            default:
                break;
        }
    }
    const exitports = await query.getManyAndCount();
    const result = new ExitPortsResponseDto(exitports[1], size);
    result.size = exitports.length;
    result.items = exitports[0];
    return result;
}
}
