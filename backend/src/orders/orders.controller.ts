import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  ApiBody
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders — dipanggil customer saat submit pesanan
  @Post()
  @ApiOperation({ 
    summary: 'Membuat pesanan baru (Publik)', 
    description: 'Endpoint publik yang digunakan oleh customer atau aplikasi kasir untuk mensubmit pesanan baru.' 
  })
  @ApiCreatedResponse({ description: 'Pesanan berhasil dibuat dan masuk ke dalam sistem.' })
  @ApiBadRequestResponse({ description: 'Validasi data gagal (misal: format tidak sesuai atau stok habis).' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // GET /orders — admin: lihat semua order
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Melihat semua pesanan (Admin/Kasir)', 
    description: 'Mengambil riwayat atau daftar semua pesanan. Memerlukan hak akses Admin atau Kasir.' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter pesanan berdasarkan status (Contoh: PENDING, PAID, CANCELLED).',
    example: 'PENDING'
  })
  @ApiOkResponse({ description: 'Berhasil mengambil daftar pesanan.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT tidak valid atau tidak disertakan.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak (Bukan Admin/Kasir).' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  // GET /orders/:id — detail satu order
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Melihat detail pesanan (Admin/Kasir)', 
    description: 'Menampilkan rincian dari satu pesanan spesifik beserta item-item yang dibeli.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID internal pesanan (Primary Key)', 
    example: 1 
  })
  @ApiOkResponse({ description: 'Detail pesanan berhasil ditemukan.' })
  @ApiNotFoundResponse({ description: 'Pesanan dengan ID tersebut tidak ditemukan.' })
  @ApiUnauthorizedResponse({ description: 'Sesi login tidak sah.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak (Bukan Admin/Kasir).' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // PATCH /orders/:id — ADMIN/KASIR: Edit pesanan (Ubah menu, tambah item, dll)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Mengubah isi pesanan (Admin/Kasir)', 
    description: 'Digunakan untuk mengedit pesanan yang sudah masuk, seperti mengubah menu atau kuantitas item.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID pesanan yang ingin diubah', 
    example: 1 
  })
  @ApiOkResponse({ description: 'Data pesanan berhasil diperbarui.' })
  @ApiBadRequestResponse({ description: 'Format modifikasi data tidak sesuai.' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan.' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    const data = await this.ordersService.update(id, dto);
    return {
      success: true,
      message: `Data pesanan #${id} berhasil diperbarui`,
      data: data,
    };
  }

  // PATCH /orders/:id/status — admin update status (PAID, CANCELLED, dll)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Mengubah status pesanan (Admin/Kasir)', 
    description: 'Mengupdate status dari sebuah pesanan (misalnya dari PENDING menjadi PAID atau CANCELLED).' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID pesanan yang akan diubah statusnya', 
    example: 1 
  })
  @ApiBody({ 
    description: 'Status baru untuk pesanan',
    schema: { 
      type: 'object', 
      properties: { 
        status: { type: 'string', example: 'PAID' } 
      } 
    } 
  })
  @ApiOkResponse({ description: 'Status pesanan berhasil diubah.' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan.' })
  @ApiUnauthorizedResponse({ description: 'Sesi login tidak sah.' })
  @ApiForbiddenResponse({ description: 'Akses ditolak.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    const data = await this.ordersService.updateStatus(id, status);
    return {
      success: true,
      message: `Status pesanan #${id} berhasil diubah menjadi ${status}`,
      data: data,
    };
  }
}