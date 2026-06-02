// src/menu/dto/create-menu.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Min, IsNotEmpty, IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { MenuCategory } from '@prisma/client'; // Import enum langsung dari Prisma
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Nama menu makanan, minuman, atau snack',
    example: 'Nasi Goreng Kambing',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Deskripsi singkat mengenai komposisi atau rasa menu',
    example: 'Nasi goreng dengan potongan daging kambing muda dan rempah pilihan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Harga menu dalam satuan Rupiah (harus bilangan bulat/integer)',
    example: 35000,
  })
  @Type(() => Number)
  @IsInt({ message: 'Harga harus berupa bilangan bulat' }) // Diubah dari IsNumber ke IsInt sesuai type Int Prisma
  @Min(0, { message: 'Harga tidak boleh negatif' })
  price!: number;

  @ApiProperty({
    description: 'Kategori dari menu berdasarkan enum Prisma',
    example: MenuCategory.FOOD,
    enum: MenuCategory, // Otomatis menampilkan pilihan FOOD, DRINK, SNACK di Swagger
  })
  @IsEnum(MenuCategory, { message: 'Kategori harus berupa FOOD, DRINK, atau SNACK' })
  @IsNotEmpty({ message: 'Kategori wajib diisi' })
  category!: MenuCategory; // Tipenya diganti menggunakan enum dari Prisma

  @ApiPropertyOptional({
    description: 'URL link gambar atau foto dari menu',
    example: 'https://res.cloudinary.com/demo/image/upload/v1234/nasgor.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: any;

  @ApiPropertyOptional({
    description: 'Karakter emoji untuk mempercantik UI tampilan menu',
    example: '🍳',
  })
  @IsOptional()
  @IsString()
  emoji?: string; // Ditambahkan sesuai field emoji di MenuItem Prisma

  @ApiProperty({
    description: 'Jumlah stok awal menu yang tersedia',
    example: 50,
  })
  @Type(() => Number)
  @IsInt({ message: 'Jumlah stock harus berupa bilangan bulat' }) // Diubah ke IsInt
  @Min(0, { message: 'Jumlah stock tidak boleh negatif' })
  jumlahStock!: number;
}