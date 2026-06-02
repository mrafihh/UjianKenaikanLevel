// src/orders/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsInt, // Diubah dari IsNumber ke IsInt
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client'; // 1. Import enum langsung dari Prisma

// 2. Class untuk item di dalam pesanan
class OrderItemDto {
  @ApiProperty({
    description: 'ID dari menu yang dipesan',
    example: 1,
  })
  @IsInt({ message: 'Menu item ID harus berupa bilangan bulat' }) // Ketat sebagai Int
  menuItemId!: number;

  @ApiProperty({
    description: 'Jumlah porsi/item yang dipesan',
    example: 2,
  })
  @IsInt({ message: 'Quantity harus berupa bilangan bulat' }) // Ketat sebagai Int
  @Min(1, { message: 'Quantity minimal 1' })
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Catatan khusus untuk item ini (misal: pedas karet 2, tanpa es)',
    example: 'Pedas banget, gak pakai sayur',
  })
  @IsOptional()
  @IsString()
  notes?: string; // 3. Ditambahkan agar sinkron dengan OrderItem.notes di Prisma
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
    example: PaymentMethod.ONLINE,
    enum: PaymentMethod, // Menampilkan pilihan dropdown otomatis di Swagger UI
  })
  @IsEnum(PaymentMethod, { message: 'Metode pembayaran harus CASH atau ONLINE' })
  paymentMethod!: PaymentMethod; // Menggunakan tipe Enum dari Prisma

  @ApiPropertyOptional({
    description: 'Catatan umum/keseluruhan untuk pesanan',
    example: 'Antar sendok tambahan ya',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Daftar item menu yang dipesan',
    type: [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan tidak boleh kosong' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}