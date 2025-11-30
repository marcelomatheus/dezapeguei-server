import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryEntity {
  @ApiProperty({ example: 'ckcat123' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  @Expose()
  name!: string;

  @ApiProperty({ type: [String], example: ['camera', 'audio'] })
  @Expose()
  keywords!: string[] | null;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
