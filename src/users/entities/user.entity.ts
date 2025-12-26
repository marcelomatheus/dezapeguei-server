import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Plan } from '@prisma/client';
export { Plan };
export class UserEntity {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: 'ckv8wk1p40001s6z7l4123efg',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'E-mail address used for login.',
    example: 'alice@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'Contact phone number.',
    example: '+55 11 99888-7766',
    nullable: true,
  })
  @Expose()
  phone!: string | null;

  @ApiProperty({
    description: 'Instagram username linked to the profile.',
    example: 'alice.shop',
    nullable: true,
  })
  @Expose()
  instagram!: string | null;

  @ApiProperty({
    description: 'Display name used inside the marketplace.',
    example: 'Alice Souza',
    nullable: true,
  })
  @Expose()
  name!: string | null;

  @ApiProperty({
    description: 'CPF document',
    example: '123.456.789-00',
    nullable: true,
  })
  @Expose()
  cpf!: string | null;

  @ApiProperty({
    description: 'Avatar URL',
    nullable: true,
  })
  @Expose()
  avatar!: string | null;

  @ApiProperty({
    description: 'User bio',
    nullable: true,
  })
  @Expose()
  bio!: string | null;

  @ApiProperty({
    description: 'User rating',
    example: 4.5,
  })
  @Expose()
  rating!: number;

  @ApiProperty({
    description: 'Number of sales',
    example: 10,
  })
  @Expose()
  salesCount!: number;

  @ApiProperty({
    description: 'Number of purchases',
    example: 5,
  })
  @Expose()
  purchasesCount!: number;

  @ApiProperty({
    description: 'City',
    nullable: true,
  })
  @Expose()
  city!: string | null;

  @ApiProperty({
    description: 'State',
    nullable: true,
  })
  @Expose()
  state!: string | null;

  @ApiProperty({
    description: 'Current subscription plan of the user.',
    enum: Plan,
    example: Plan.FREE,
  })
  @Expose()
  plan!: Plan;

  @ApiProperty({
    description: 'Creation timestamp in ISO 8601 format.',
    example: '2024-10-12T15:30:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp in ISO 8601 format.',
    example: '2024-10-13T18:05:12.000Z',
  })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
