// src/xendit/dto/create-checkout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateXenditDto {
  @ApiProperty({ description: 'ID Pesanan dari tabel Order', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  orderId!: number;

  @ApiProperty({ description: 'Total harga yang harus dibayar', example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ description: 'Nama pelanggan', example: 'Mattew Gilam' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ description: 'Email pelanggan (opsional, untuk resi Xendit)', required: false, example: 'mattew@example.com' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;
}