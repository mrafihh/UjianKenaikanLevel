// src/orders/dto/create-order.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  menuItemId: number;

  @IsNumber()
  @Min(1, { message: 'Quantity minimal 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nomor meja wajib diisi' })
  tableNumber: string;

  @IsEnum(['CASH', 'QRIS'], { message: 'Metode pembayaran harus CASH atau QRIS' })
  paymentMethod: 'CASH' | 'QRIS';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan tidak boleh kosong' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}