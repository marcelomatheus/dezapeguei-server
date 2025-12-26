import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationEntity {
  @ApiProperty({ example: 'ckn1' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'cku1' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'Your order has shipped' })
  @Expose()
  message!: string;

  @ApiProperty({ example: false })
  @Expose()
  isRead!: boolean;

  @ApiProperty({ example: '/orders/123', nullable: true })
  @Expose()
  redirect!: string | null;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<NotificationEntity>) {
    Object.assign(this, partial);
  }
}
