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
  menuItemId!: number; // 👈 Tambahkan ! di sini

  @IsNumber()
  @Min(1, { message: 'Quantity minimal 1' })
  quantity!: number;   // 👈 Tambahkan ! di sini
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan wajib diisi' })
  customerName!: string; // 👈 Tambahkan ! di sini

  @IsString()
  @IsNotEmpty({ message: 'Nomor meja wajib diisi' })
  tableNumber!: string;  // 👈 Tambahkan ! di sini

  @IsEnum(['CASH', 'QRIS'], { message: 'Metode pembayaran harus CASH atau QRIS' })
  paymentMethod!: 'CASH' | 'QRIS'; // 👈 Tambahkan ! di sini

  // Catatan: 'notes' tidak perlu tanda '!' karena dia sudah menggunakan '?' (opsional)
  @IsOptional()
  @IsString()
  notes?: string; 

  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan tidak boleh kosong' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]; // 👈 Tambahkan ! di sini
}