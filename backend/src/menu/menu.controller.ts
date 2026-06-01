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
  UseGuards 
} from '@nestjs/common';
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
  ApiNotFoundResponse 
} from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Menambahkan menu baru (Admin)', 
    description: 'Membuat data makanan atau minuman baru ke database. Memerlukan token JWT Admin.' 
  })
  @ApiCreatedResponse({ description: 'Menu berhasil ditambahkan!' })
  @ApiBadRequestResponse({ description: 'Format data request salah atau validasi DTO gagal.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT tidak valid atau tidak disertakan.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak karena user bukan ADMIN.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createMenuDto: CreateMenuDto) {
    const data = await this.menuService.create(createMenuDto);
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
  @ApiOperation({ 
    summary: 'Mengupdate data menu (Admin)', 
    description: 'Mengubah informasi sebagian field pada data menu berdasarkan ID. Memerlukan token JWT Admin.' 
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto
  ) {
    const data = await this.menuService.update(id, updateMenuDto);
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