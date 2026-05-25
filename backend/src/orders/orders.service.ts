// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const TAX_RATE = 0.1;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const menuIds = dto.items.map((i) => i.menuItemId);

    // 1. Validasi semua menu item exist dan available
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuIds }, isAvailable: true },
    });

    if (menuItems.length !== menuIds.length) {
      throw new BadRequestException(
        'Beberapa item tidak tersedia atau tidak ditemukan',
      );
    }

    // 2. Hitung harga server-side — JANGAN pakai harga dari client
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const itemsWithPrice = dto.items.map((item) => {
      const menu = menuMap.get(item.menuItemId)!;
      const unitPrice = menu.price;
      subtotal += unitPrice * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice };
    });

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    // 3. Simpan order + items dalam satu transaction
    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          tableNumber: dto.tableNumber,
          paymentMethod: dto.paymentMethod,
          notes: dto.notes,
          subtotal,
          tax,
          total,
          items: {
            create: itemsWithPrice.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: { menuItem: true },
          },
        },
      });
    });

    return order;
  }

  // Ambil semua order — untuk admin dashboard
  async findAll(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Ambil satu order by ID
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order #${id} tidak ditemukan`);
    return order;
  }

  // Update status order — dipanggil admin/kasir
  async updateStatus(id: number, status: string) {
    await this.findOne(id); // validasi exist dulu
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: { include: { menuItem: true } },
      },
    });
  }
}