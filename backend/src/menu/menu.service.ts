// src/menu/menu.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // 👈 Tambahkan import ini
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService // 👈 Inject CloudinaryService di sini
  ) {}

  // CREATE: Tambah menu baru (Admin)
// CREATE: Tambah menu baru (Admin)
  // 👇 Tambahkan parameter `file?: Express.Multer.File`
  async create(dto: CreateMenuDto, file?: Express.Multer.File) {
    let uploadedImageUrl: string | undefined = undefined;

    // 1. Jika admin melampirkan file gambar, upload dulu ke Cloudinary
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      uploadedImageUrl = uploadResult.secure_url;
    }

    // 2. Antisipasi tipe data Multipart/Form-Data (Ubah string angka menjadi Integer)
    const parsedPrice = dto.price ? parseInt(dto.price as any, 10) : 0;
    const parsedStock = dto.jumlahStock ? parseInt(dto.jumlahStock as any, 10) : 0;

    // Pisahkan price dan jumlahStock versi string bawaan DTO agar tidak merusak database
    const { price, jumlahStock, ...restDto } = dto as any;

    // 3. Simpan data baru ke database
    return this.prisma.menuItem.create({
      data: {
        ...restDto,
        price: parsedPrice,          // Masukkan price yang sudah berwujud angka
        jumlahStock: parsedStock,    // Masukkan stok yang sudah berwujud angka
        // Gunakan teknik aman TypeScript seperti di fungsi PATCH kemarin
        ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}), 
      },
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
  async update(id: number, dto: UpdateMenuDto, file?: Express.Multer.File) {
    await this.findOne(id); // Pastikan item ada sebelum diupdate

    let uploadedImageUrl: string | undefined = undefined; // 👈 Berikan tipe data yang jelas

    // 1. Jika admin melampirkan gambar baru, unggah ke Cloudinary
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      uploadedImageUrl = uploadResult.secure_url; // Ambil URL HTTPS dari Cloudinary
    }

    // 2. Antisipasi tipe data Multipart/Form-Data
    const parsedPrice = dto.price !== undefined ? parseInt(dto.price as any, 10) : undefined;
    const parsedStock = dto.jumlahStock !== undefined ? parseInt(dto.jumlahStock as any, 10) : undefined;

    // Pisahkan price dan jumlahStock lama (string) agar tidak menimpa data baru
    const { price, jumlahStock, ...restDto } = dto as any;

    // 3. Simpan perubahan ke database
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...restDto, // Masukkan semua field string (name, description, category)
        // 👇 Gunakan ternary operator agar selalu mengembalikan object
        ...(parsedPrice !== undefined ? { price: parsedPrice } : {}), 
        ...(parsedStock !== undefined ? { jumlahStock: parsedStock } : {}), 
        ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}), 
      },
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