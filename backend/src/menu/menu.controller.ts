import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  Query, 
  ParseBoolPipe, 
  DefaultValuePipe, 
  UseGuards,
  UseInterceptors,     // 👈 Ditambahkan untuk penanganan file upload
  UploadedFile        // 👈 Ditambahkan untuk menangkap objek file gambar
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 👈 Ditambahkan
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiParam, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse, 
  ApiForbiddenResponse, 
  ApiNotFoundResponse,
  ApiConsumes,         // 👈 Ditambahkan untuk dokumentasi Swagger multipart/form-data
  ApiBody             // 👈 Ditambahkan untuk merinci skema body form-data di Swagger
} from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image')) // 👈 Tambahkan interceptor file di sini
  @ApiConsumes('multipart/form-data')       // 👈 Mengubah tipe form di Swagger menjadi form-data
  @ApiBody({
    description: 'Menambahkan menu baru beserta file gambar',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nama menu baru', example: 'Nasi Goreng Gila' },
        price: { type: 'integer', description: 'Harga menu', example: 25000 },
        description: { type: 'string', description: 'Deskripsi menu', example: 'Nasi goreng super pedas dengan topping melimpah' },
        category: { type: 'string', enum: ['FOOD', 'DRINK', 'SNACK'], description: 'Kategori menu', example: 'FOOD' },
        emoji: { type: 'string', description: 'Emoji menu', example: '🍳' },
        jumlahStock: { type: 'integer', description: 'Jumlah stok awal', example: 100 },
        // 👇 Tombol upload gambar di Swagger UI
        image: {
          type: 'string',
          format: 'binary',
          description: 'File gambar menu (.png, .jpg, .jpeg, .webp) - Opsional',
        },
      },
      required: ['name', 'price', 'category'], // 👈 Field yang wajib diisi sesuai schema Prisma
    },
  })
  @ApiOperation({ 
    summary: 'Menambahkan menu baru (Admin)', 
    description: 'Membuat data makanan atau minuman baru ke database beserta upload gambar ke Cloudinary. Memerlukan token JWT Admin.' 
  })
  @ApiCreatedResponse({ description: 'Menu berhasil ditambahkan!' })
  @ApiBadRequestResponse({ description: 'Format data request salah atau validasi gagal.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT tidak valid atau tidak disertakan.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak karena user bukan ADMIN.' })
  async create(
    @Body() createMenuDto: CreateMenuDto,
    @UploadedFile() file?: Express.Multer.File, // 👈 Ambil payload file gambar di sini
  ) {
    // Kirim DTO beserta file gambar ke service
    const data = await this.menuService.create(createMenuDto, file);
    return {
      success: true,
      message: 'Menu berhasil ditambahkan!',
      data: data,
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Mengambil semua data menu', 
    description: 'Mengambil daftar semua menu yang terdaftar di sistem. Bisa difilter berdasarkan ketersediaan.' 
  })
  @ApiQuery({ 
    name: 'availableOnly', 
    required: false, 
    type: Boolean, 
    description: 'Jika true, hanya menampilkan menu dengan stok > 0. Jika false, menampilkan semua.',
    example: true 
  })
  @ApiOkResponse({ description: 'Berhasil mengambil daftar menu.' })
  findAll(
    @Query('availableOnly', new DefaultValuePipe(true), ParseBoolPipe) availableOnly: boolean
  ) {
    return this.menuService.findAll(availableOnly);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Mengambil detail satu menu', 
    description: 'Mencari dan menampilkan informasi menu secara spesifik menggunakan ID.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID internal menu (Primary Key)', 
    example: 1 
  })
  @ApiOkResponse({ description: 'Detail data menu berhasil ditemukan.' })
  @ApiNotFoundResponse({ description: 'Data menu dengan ID yang diminta tidak ada di database.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image')) // 👈 'image' adalah KEY multipart/form-data saat upload file
  @ApiConsumes('multipart/form-data')       // 👈 Menginstruksikan Swagger UI untuk mengubah tipe form
  @ApiBody({
    description: 'Modifikasi sebagian data menu sekaligus mengunggah gambar baru',
    schema: {
      type: 'object',
      properties: {
        // Laporkan field dari UpdateMenuDto Anda secara eksplisit agar kolom input teks tetap tampil di Swagger
        name: { type: 'string', description: 'Nama menu baru', example: 'Es Kopi Susu Creamy' },
        price: { type: 'integer', description: 'Harga menu (akan dibaca string oleh form-data, dikonversi di service)', example: 20000 },
        description: { type: 'string', description: 'Deskripsi menu', example: 'Kopi susu dengan racikan krim rahasia' },
        category: { type: 'string', enum: ['FOOD', 'DRINK', 'SNACK'], description: 'Kategori menu', example: 'DRINK' },
        jumlahStock: { type: 'integer', description: 'Jumlah stok fisik menu', example: 35 },
        // 👇 Skema properti biner agar tombol "Choose File" muncul di Swagger UI
        image: {
          type: 'string',
          format: 'binary',
          description: 'File gambar menu (.png, .jpg, .jpeg, .webp)',
        },
      },
    },
  })
  @ApiOperation({ 
    summary: 'Mengupdate data menu beserta gambar baru (Admin)', 
    description: 'Mengubah informasi sebagian field pada data menu berdasarkan ID sekaligus memperbarui gambar menu di Cloudinary. Memerlukan token JWT Admin.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID menu yang ingin diperbarui data-nya', 
    example: 1 
  })
  @ApiOkResponse({ description: 'Menu berhasil diupdate!' })
  @ApiBadRequestResponse({ description: 'Input modifikasi data tidak valid.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT tidak ditemukan atau kedaluwarsa.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak karena hak akses bukan ADMIN.' })
  @ApiNotFoundResponse({ description: 'Menu yang ingin diupdate tidak ditemukan.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @UploadedFile() file?: Express.Multer.File, // 👈 Menangkap payload gambar opsional dari admin
  ) {
    // Mengirim data DTO sekaligus objek file gambar ke menuService
    const data = await this.menuService.update(id, updateMenuDto, file);
    return {
      success: true,
      message: `Menu #${id} berhasil diupdate!`,
      data: data,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Menghapus menu secara permanen (Admin)', 
    description: 'Menghapus data record menu secara hard-delete dari database menggunakan ID. Memerlukan token JWT Admin.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID menu yang ingin dihapus', 
    example: 1 
  })
  @ApiOkResponse({ description: 'Menu berhasil dihapus permanen!' })
  @ApiUnauthorizedResponse({ description: 'Sesi login tidak sah.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak (Bukan Admin).' })
  @ApiNotFoundResponse({ description: 'Menu gagal dihapus karena ID tidak ditemukan.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuService.remove(id);
    return {
      success: true,
      message: `Menu #${id} berhasil dihapus permanen!`,
      data: data,
    };
  }
}