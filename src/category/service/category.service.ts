import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { Repository } from 'typeorm';
import { CategoryDto } from '../dtos/category.dto';
import { CategoryOrderBy } from '../dtos/categoryOrderBy.enum.dto';
import { CategoryResponseDto } from '../dtos/category.response.dto';
import { FindCategoryDto } from '../dtos/findCategory.dto';

@Injectable()
export class CategoryService {
    // Create a logger instance
    private logger = new Logger('CategoryService');

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) { }

    async getAll() {
        const category = await this.categoryRepository.find({ where: { active: true } });
        return category;
    }

    async getCategory(id: number): Promise<CategoryDto> {
        const response = await this.categoryRepository.findOne(id)
        return response
    }

    async create(createDto: CategoryDto): Promise<Category> {
        const newCategory = new CategoryDto();
        newCategory.active = true;
        Object.assign(newCategory, createDto);
        const response = await this.categoryRepository.save(newCategory);
        return response;
    }

    async update(updateDto: CategoryDto) {
        const category = await this.categoryRepository.findOne(updateDto.id);
        if (!category) { throw new BadRequestException('Categoria no existe'); }
        try {
            await this.categoryRepository.update(updateDto.id, updateDto);
            return updateDto.id;
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Error en request');
        }
    }
    

    async deleteById(updateDto: CategoryDto) {
        await this.categoryRepository.findOne(updateDto.id);
        if (updateDto) {
            updateDto.active = false;
            await this.categoryRepository.save(updateDto);
        }
    }

    async getAllFilterCategory(filter: FindCategoryDto, page: number,
        size: number,
        orderBy?: CategoryOrderBy,
        order: 'ASC' | 'DESC' = 'ASC') {

        let query = this.categoryRepository
            .createQueryBuilder('category')
            .skip(size * (page - 1))
            .take(size);

        if (filter && JSON.parse(filter.filterActive)) {
            const active = JSON.parse(filter.active);
            query = query.andWhere('category.active=:active', { active });
        }
        if (filter && filter.name) {
            query = query.andWhere('category.name=:name', { name: filter.name });
        }
        if (filter.ids) {
            const ids= filter.ids.split(',').map((i) => parseInt(i, null));
            query = query.andWhereInIds(ids);
        }
        if (orderBy) {
            switch (orderBy) {
                case CategoryOrderBy.name:
                    query.addOrderBy('category.name', order);
                    break;
                default:
                    break;
            }
        }
        const categories = await query.getManyAndCount();
        const result = new CategoryResponseDto(categories[1], size);
        result.size = categories.length;
        result.items = categories[0];
        return result;
    }
}
