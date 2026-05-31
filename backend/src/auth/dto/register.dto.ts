import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(5, { message: 'Password minimal harus 6 karakter' })
  password!: string;

  @IsEnum(Role, { message: 'Role harus berupa ADMIN atau KASIR' })
  role!: Role;
}