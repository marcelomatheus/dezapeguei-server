import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        keywords: dto.keywords ?? [],
      },
    });
  }

  findAll(query: FindCategoriesQueryDto): Promise<CategoryEntity[]> {
    const where: Prisma.CategoryWhereInput = {
      name: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
    };
    return this.prisma.category
      .findMany({
        where,
        orderBy: { name: 'asc' },
      })
      .catch((error: Error) => {
        return handleError(error, 'CategoriesService.findAll');
      });
  }

  async findById(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category)
        throw new NotFoundException(`Category with id ${id} not found`);
      return category;
    } catch (error) {
      return handleError(error as Error, 'CategoriesService.findById');
    }
  }

  update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    return this.prisma.category
      .update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          keywords: dto.keywords ?? undefined,
        },
      })
      .catch((error: Error) => {
        return handleError(error, 'CategoriesService.update');
      });
  }

  remove(id: string): Promise<CategoryEntity> {
    return this.prisma.category
      .delete({ where: { id } })
      .catch((error: Error) => {
        return handleError(error, 'CategoriesService.remove');
      });
  }
}
