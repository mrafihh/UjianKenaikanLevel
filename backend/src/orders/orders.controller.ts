// src/orders/orders.controller.ts
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
import { UpdateOrderDto } from './dto/update-order.dto'; // 👈 IMPORT DTO BARU
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders — dipanggil customer saat submit pesanan
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'KASIR')
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // GET /orders — admin: lihat semua order
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'KASIR')
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  // GET /orders/:id — detail satu order
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'KASIR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // PATCH /orders/:id — ADMIN/KASIR: Edit pesanan (Ubah menu, tambah item, dll)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'KASIR')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'KASIR')
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

