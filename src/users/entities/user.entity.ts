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
  })
  @Expose()
  phone!: string;

  @ApiProperty({
    description: 'Instagram username linked to the profile.',
    example: 'alice.shop',
    nullable: true,
  })
  @Expose()
  instagram!: string | null;

  @ApiProperty({
    description: 'Accumulated trust score.',
    example: 42,
  })
  @Expose()
  score!: number;

  @ApiProperty({
    description: 'Display name used inside the marketplace.',
    example: 'Alice Souza',
    nullable: true,
  })
  @Expose()
  name!: string | null;

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
