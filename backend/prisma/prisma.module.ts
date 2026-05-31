// prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 Membuat module ini bisa diakses di mana saja tanpa perlu di-import berulang kali
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 Membagikan PrismaService agar bisa dipakai modul lain
})
export class PrismaModule {}