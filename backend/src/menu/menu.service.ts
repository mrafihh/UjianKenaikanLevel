// src/menu/menu.service.ts
import { Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
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

  // READ ALL: Ambil semua menu (isAvailableOnly = true untuk pelanggan, false untuk admin)
  async findAll(isAvailableOnly: boolean = true) {
    const whereCondition = isAvailableOnly ? { isAvailable: true } : {};
    
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

  // DELETE: Hapus menu (Admin)
async remove(id: number) {
  // 1. Cek dulu apakah menunya memang ada
  const menu = await this.prisma.menuItem.findUnique({ where: { id } });
  if (!menu) throw new NotFoundException(`Menu dengan ID #${id} tidak ditemukan`);

  try {
    // 2. Coba hapus
    return await this.prisma.menuItem.delete({ where: { id } });
  } catch (error) {
    // 3. Jika gagal karena ditolak database (ada relasi), berikan pesan resmi
    throw new BadRequestException(
      'Menu tidak bisa dihapus karena sudah memiliki riwayat transaksi. Silakan ubah status "isAvailable" menjadi false saja.',
    );
  }
}
}