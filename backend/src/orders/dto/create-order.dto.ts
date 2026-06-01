// src/orders/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

// 1. Definisikan dekorator Swagger untuk item di dalam pesanan
class OrderItemDto {
  @ApiProperty({
    description: 'ID dari menu yang dipesan',
    example: 1,
  })
  @IsNumber()
  menuItemId!: number;

  @ApiProperty({
    description: 'Jumlah porsi/item yang dipesan',
    example: 2,
  })
  @IsNumber()
  @Min(1, { message: 'Quantity minimal 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Nama pelanggan yang memesan',
    example: 'Budi Santoso',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan wajib diisi' })
  customerName!: string;

  @ApiProperty({
    description: 'Nomor atau kode meja pelanggan',
    example: 'Meja 05',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nomor meja wajib diisi' })
  tableNumber!: string;

  @ApiProperty({
    description: 'Metode pembayaran yang dipilih',
    example: 'QRIS',
    enum: ['CASH', 'QRIS'], // Menampilkan pilihan dropdown di Swagger UI
  })
  @IsEnum(['CASH', 'QRIS'], { message: 'Metode pembayaran harus CASH atau QRIS' })
  paymentMethod!: 'CASH' | 'QRIS';

  @ApiPropertyOptional({
    description: 'Catatan tambahan untuk pesanan (misal: pedas, tanpa es)',
    example: 'Nasi gorengnya minta pedas karet dua, es teh manisnya diganti hangat',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // 2. Gunakan type dan isArray agar Swagger tahu ini adalah list dari OrderItemDto
  @ApiProperty({
    description: 'Daftar item menu yang dipesan',
    type: [OrderItemDto], // Menghubungkan ke class OrderItemDto di atas
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan tidak boleh kosong' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}