import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Nama menu makanan, minuman, atau snack',
    example: 'Nasi Goreng Kambing',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  name!: string;

  // Menggunakan @ApiPropertyOptional karena field ini bersifat optional
  @ApiPropertyOptional({
    description: 'Deskripsi singkat mengenai komposisi atau rasa menu',
    example: 'Nasi goreng dengan potongan daging kambing muda dan rempah pilihan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Harga menu dalam satuan Rupiah (angka saja)',
    example: 35000,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Harga wajib diisi' })
  price!: number;

  @ApiProperty({
    description: 'Kategori dari menu',
    example: 'MAKANAN',
    enum: ['MAKANAN', 'MINUMAN', 'SNACK'], // Menampilkan daftar pilihan yang valid di Swagger UI
  })
  @IsString()
  @IsNotEmpty({ message: 'Kategori wajib diisi' })
  category!: string;

  @ApiPropertyOptional({
    description: 'URL link gambar atau foto dari menu',
    example: 'https://res.cloudinary.com/demo/image/upload/v1234/nasgor.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Jumlah stok awal menu yang tersedia',
    example: 50,
  })
  @IsNumber()
  @Min(0, { message: 'Jumlah stock tidak boleh negatif' })
  jumlahStock!: number;
}