// src/menu/menu.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; 
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService 
  ) {}

  // CREATE: Tambah menu baru (Admin)
// CREATE: Tambah menu baru (Admin)
  // 👇 Tambahkan parameter `file?: Express.Multer.File`
  async create(dto: CreateMenuDto, file?: Express.Multer.File) {
    let uploadedImageUrl: string | undefined = undefined;

// 1. Jika admin melampirkan file gambar, upload dulu ke Cloudinary
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        uploadedImageUrl = uploadResult.secure_url;
      } catch (error) {
        // 👇 Menangkap error Cloudinary agar tidak menyebabkan aplikasi crash (500)
        console.error('Cloudinary Upload Error:', error);
        throw new BadRequestException('Gagal mengunggah gambar. Pastikan kredensial Cloudinary valid dan gambar tidak rusak.');
      }
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

    let uploadedImageUrl: string | undefined = undefined; 

// 1. Jika admin melampirkan file gambar, upload dulu ke Cloudinary
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        uploadedImageUrl = uploadResult.secure_url;
      } catch (error) {
        // 👇 Menangkap error Cloudinary agar tidak menyebabkan aplikasi crash (500)
        console.error('Cloudinary Upload Error:', error);
        throw new BadRequestException('Gagal mengunggah gambar. Pastikan kredensial Cloudinary valid dan gambar tidak rusak.');
      }
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
      where: { id }
    });

    if (!menu) throw new NotFoundException(`Menu dengan ID #${id} tidak ditemukan`);

    const activeOrdersCount = await this.prisma.orderItem.count({
      where: {
        menuItemId: id,
        order: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED'], // Hanya nge-block jika statusnya Pending/Paid/Preparing/Ready
          },
        },
      },
    });

    // 3. Jika ada pesanan yang masih berjalan, blokir penghapusan
    if (activeOrdersCount > 0) {
      throw new BadRequestException(
        'Menu tidak bisa dihapus karena masih ada pesanan pelanggan yang sedang berjalan (aktif). Selesaikan atau batalkan pesanan tersebut terlebih dahulu, atau ubah stok menu menjadi 0.'
      );
    }

    // 4. Jika aman (tidak ada pesanan aktif), lanjutkan penghapusan secara permanen
    // Berdasarkan schema database kamu, ini akan memicu efek "Cascade"
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
