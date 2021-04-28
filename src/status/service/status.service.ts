import { Injectable } from '@nestjs/common';
import { Status } from '../../entities/status.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StatusService {

    constructor(
        @InjectRepository(Status)
        private readonly statusRepository: Repository<Status>,
    ) {
    }

    async get(id: number) {
        return await this.statusRepository.findOne(id);
    }

}
