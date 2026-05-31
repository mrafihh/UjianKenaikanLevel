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
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders — dipanggil customer saat submit pesanan
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // GET /orders — admin: lihat semua order
  // GET /orders?status=PENDING — filter by status
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

  // PATCH /orders/:id/status — admin update status (CONFIRMED, PREPARING, dll)
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
      data: data
    };
  }
}