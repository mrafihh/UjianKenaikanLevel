import { IsString, IsNotEmpty, MinLength, IsEnum, isNotEmpty, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama restoran tidak boleh kosong' })
  namaRestoran!: string;

  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username!: string;

  @IsString()
  @MinLength(10, { message: 'Nomor telepon minimal harus 10 digit' })
  @MaxLength(15, { message: 'Nomor telepon maksimal harus 15 digit' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(5, { message: 'Password minimal harus 6 karakter' })
  password!: string;
}