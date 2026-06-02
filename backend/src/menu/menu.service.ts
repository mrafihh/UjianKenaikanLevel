// src/menu/menu.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // CREATE: Tambah menu baru (Admin)
  async create(dto: CreateMenuDto) {
    return this.prisma.menuItem.create({
      data: dto,
    });
  }

  // READ ALL: Ambil semua menu (inStockOnly = true untuk pelanggan, false untuk admin)
  async findAll(inStockOnly: boolean = true) {
    const whereCondition = inStockOnly ? { jumlahStock: { gt: 0 } } : {};
    
    return this.prisma.menuItem.findMany({
      where: whereCondition,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  // READ ONE: Ambil satu item
  async findOne(id: number) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Menu item #${id} tidak ditemukan`);
    return item;
  }

  // UPDATE: Ubah data menu (Admin)
  async update(id: number, dto: UpdateMenuDto) {
    await this.findOne(id); // Pastikan item ada sebelum diupdate
    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  // DELETE: Hapus menu (Admin) - FIXED VERSION 🚀
  async remove(id: number) {
    // 1. Cek dulu apakah menunya memang ada, sekalian hitung ada berapa kali menu ini pernah dipesan
    const menu = await this.prisma.menuItem.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { orderItems: true } // Menghitung total orderItems terkait secara efisien
        }
      }
    });

    if (!menu) throw new NotFoundException(`Menu dengan ID #${id} tidak ditemukan`);

    // 2. Jika count > 0, gagalkan penghapusan secara sengaja sebelum database menghapus paksa riwayatnya
    if (menu._count.orderItems > 0) {
      throw new BadRequestException(
        'Menu tidak bisa dihapus karena sudah memiliki riwayat transaksi. Silakan ubah stok menjadi 0 saja agar tidak tampil di aplikasi pelanggan.',
      );
    }

    // 3. Jika benar-benar bersih belum pernah dipesan, baru boleh dihapus aman
    return await this.prisma.menuItem.delete({ where: { id } });
  }
}