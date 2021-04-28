import { Controller, Logger, Get, UsePipes, ValidationPipe, Query, Post, Body, Param, Put, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './service/category.service';
import { CategoryDto } from './dtos/category.dto';
import { ComposeGuard } from '../shared/guards/auth.guard';
import { FindCategoryDto } from './dtos/findCategory.dto';
import { CategoryOrderBy } from './dtos/categoryOrderBy.enum.dto';

@Controller('category')
@ApiTags('Category')
@ApiBearerAuth()
@ApiSecurity('api_key')
@UseGuards(ComposeGuard)
export class CategoryController {
    // Create a logger instance
    private logger = new Logger('CategoryController');

    constructor(private categoryService: CategoryService) {
    }

    @Get()
    @ApiOkResponse({
        description: 'Servicio para obtener Categorias',
    })
    async get() {
        return await this.categoryService.getAll();
    }

    @Get('/filter')
    @ApiQuery({
        name: 'orderBy',
        enum: ['Name', 'None'],
        required: false,
    })
    @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
    @ApiOkResponse({
        description: 'Servicio para obtener Categorias',
    })
    async getFilter(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query() filter: FindCategoryDto,
        @Query('orderBy') orderBy?: CategoryOrderBy,
        @Query('order') order?: 'ASC' | 'DESC' | undefined) {
        return await this.categoryService.getAllFilterCategory(filter, page,
            size,
            orderBy,
            order);
    }

    @Get('/:id')
    @ApiBody({type: CategoryDto})
    @ApiOkResponse({
        description: 'Servicio para obtener una Categoria',
    })
    async getCategory(@Param('id') id) {
        return await this.categoryService.getCategory(id);
    }

    @Post()
    @ApiBody({type: CategoryDto})
    @ApiOkResponse({
        description: 'Servicio para crear Categoria',
    })
    @UsePipes(ValidationPipe)
    async post(@Body() createCategoryDto: CategoryDto) {
        const response = await this.categoryService.create(createCategoryDto);
        return response;
    }

    @Put('upload')
    @ApiBody({ type: CategoryDto })
    @ApiOkResponse({
        description: 'Servicio para actualizar una Categoria',
    })
    @UsePipes(ValidationPipe)
    async update(@Body() updateDto: CategoryDto) {
        const response = await this.categoryService.update(updateDto);
        return response;
    }


    @Put()
    @ApiBody({ type: CategoryDto })
    @ApiOkResponse({
        description: 'Servicio para desactivar una Categoria',
    })
    @UsePipes(ValidationPipe)
    async updateActive(@Body() updateDto: CategoryDto) {
        const response = await this.categoryService.deleteById(updateDto);
        return response
    }
}