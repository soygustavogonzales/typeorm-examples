import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Designer } from '../../entities/designer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DesignerService {
    // Create a logger instance
    private logger = new Logger('DesignerService');

    constructor(
        @InjectRepository(Designer)
        private readonly designerRepository: Repository<Designer>,
    ) { }

    async getAll() {
        const designer = await this.designerRepository.find();
        return designer;

    }
}
