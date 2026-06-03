import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. LOGIKA REGISTER
  async register(dto: RegisterDto) {
    // Cek apakah username sudah terpakai
    const userExists = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (userExists) {
      throw new BadRequestException('Username sudah digunakan!');
    }

    // Amankan password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Simpan ke database
    const user = await this.prisma.user.create({
      data: {
        namaRestoran: dto.namaRestoran,
        username: dto.username,
        phone: dto.phone,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Hilangkan password dari response demi keamanan
    const { password, ...result } = user;
    return result;
  }

  // 2. LOGIKA LOGIN
  async login(dto: LoginDto) {
    // Cari user berdasarkan username
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah!');
    }

    // Bandingkan password yang diinput dengan yang ada di database
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah!');
    }

    // Siapkan data payload tersembunyi di dalam token
    const payload = { id: user.id, username: user.username, role: user.role };

    return {
      success: true,
      message: 'Login berhasil!',
      accessToken: this.jwtService.sign(payload),
    };
  }
}