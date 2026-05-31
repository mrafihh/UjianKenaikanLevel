// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Mengambil token dari header 'Authorization: Bearer <TOKEN>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  // Fungsi ini otomatis berjalan jika token JWT valid
  async validate(payload: { id: number; username: string; role: string }) {
    // Cek ulang ke database untuk memastikan user-nya memang masih aktif
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('User sudah tidak terdaftar di sistem');
    }

    // Data ini akan otomatis disisipkan ke dalam object Request (req.user)
    return { id: user.id, username: user.username, role: user.role };
  }
}