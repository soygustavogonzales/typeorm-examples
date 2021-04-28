import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from '../entities/status.entity';
import { StatusService } from './service/status.service';

@Module({
    imports: [TypeOrmModule.forFeature([Status])],
    controllers: [],
    providers: [StatusService],
})
export class StatusModule { }
