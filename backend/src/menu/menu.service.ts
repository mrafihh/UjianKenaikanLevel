// src/menu/menu.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // Ambil semua menu yang tersedia, digroup per kategori
  async findAll() {
    const items = await this.prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return items;
  }

  // Ambil satu item — dipakai saat validasi order
  async findOne(id: number) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Menu item #${id} tidak ditemukan`);
    return item;
  }
}