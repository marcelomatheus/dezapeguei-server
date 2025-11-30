import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { handleError } from '../utils/handle-error';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user
      .create({
        data: this.mapCreateDtoToPrisma(createUserDto),
      })
      .catch((error: Error) => handleError(error, 'UsersService.create'));
  }

  findAll(query: FindUsersQueryDto) {
    const filters: Prisma.UserWhereInput = {
      plan: query.plan,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return this.prisma.user
      .findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
      })
      .catch((error: Error) => {
        return handleError(error, 'UsersService.findAll');
      });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.prisma.user
      .findUnique({ where: { id } })
      .catch((error: Error) => {
        return handleError(error, 'UsersService.findById');
      });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const updated = await this.prisma.user
      .update({
        where: { id },
        data: this.mapUpdateDtoToPrisma(updateUserDto),
      })
      .catch((error: Error) => {
        return handleError(error, 'UsersService.update');
      });

    return updated;
  }

  async remove(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } }).catch((error: Error) => {
      return handleError(error, 'UsersService.remove');
    });
  }

  private mapCreateDtoToPrisma({
    email,
    phone,
    instagram,
    score,
    plan,
    name,
  }: CreateUserDto): Prisma.UserCreateInput {
    return {
      email,
      phone,
      instagram: instagram ?? null,
      score: score ?? undefined,
      plan,
      name: name ?? null,
    };
  }

  private mapUpdateDtoToPrisma({
    email,
    phone,
    instagram,
    score,
    plan,
    name,
  }: UpdateUserDto): Prisma.UserUpdateInput {
    return {
      email,
      phone,
      instagram: instagram ?? undefined,
      score: score ?? undefined,
      plan,
      name: name ?? undefined,
    };
  }
}
