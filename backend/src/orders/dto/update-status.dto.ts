// src/orders/dto/update-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Status baru untuk pesanan',
    example: OrderStatus.PAID,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus, { message: 'Status harus bernilai PENDING, PAID, PREPARING, READY, COMPLETED, atau CANCELLED' })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status!: OrderStatus;
}