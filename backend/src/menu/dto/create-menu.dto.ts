import { Min, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsNumber()
  @Min(0, { message: 'Jumlah stock tidak boleh negatif' })
  jumlahStock!: number;
}