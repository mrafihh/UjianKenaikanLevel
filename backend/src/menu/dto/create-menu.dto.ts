import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Harga wajib diisi' })
  price!: number;

  @IsString()
  @IsNotEmpty({ message: 'Kategori wajib diisi' })
  category!: string; // Contoh: 'MAKANAN', 'MINUMAN', 'SNACK'

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}