// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XenditService } from '../xendit/xendit.service'; 
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const TAX_RATE = 0.1;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private xenditService: XenditService, 
  ) {}

  async create(dto: CreateOrderDto) {
    const menuIds = dto.items.map((i) => i.menuItemId);

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuIds } },
    });

    if (menuItems.length !== menuIds.length) {
      throw new BadRequestException('Beberapa item tidak ditemukan di dalam sistem');
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const itemsWithPrice = dto.items.map((item) => {
      const menu = menuMap.get(item.menuItemId)!;

      if (menu.jumlahStock < item.quantity) {
        throw new BadRequestException(
          `Gagal memesan! Stok untuk menu "${menu.name}" hanya tersisa ${menu.jumlahStock} porsi.`,
        );
      }

      const unitPrice = menu.price;
      subtotal += unitPrice * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice };
    });

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    // 1. JALANKAN TRANSAKSI PRISMA (Simpan ke DB dulu)
    const createdOrder = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName: dto.customerName,
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
        include: { items: { include: { menuItem: true } } },
      });

      for (const item of itemsWithPrice) {
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: { jumlahStock: { decrement: item.quantity } },
        });
      }
      return newOrder;
    });

    // 2. PROSES XENDIT (Jika pelanggan pilih ONLINE)
    if (createdOrder.paymentMethod === 'ONLINE') {
      try {
        // Buat tagihan ke Xendit menggunakan ID asli dari DB
        const invoice = await this.xenditService.createInvoice({
          orderId: createdOrder.id,
          amount: createdOrder.total,
          customerName: createdOrder.customerName,
        });

        // Update database untuk memasukkan URL Xendit
        const updatedOrder = await this.prisma.order.update({
          where: { id: createdOrder.id },
          data: {
            paymentUrl: invoice.invoice_url,
          },
          include: { items: { include: { menuItem: true } } },
        });

        return {
          message: 'Pesanan berhasil dibuat, silakan lakukan pembayaran',
          data: updatedOrder,
        };
      } catch (error) {
        throw new BadRequestException('Pesanan tersimpan di sistem, tetapi gagal membuat link pembayaran Xendit.');
      }
    }

    // 3. JIKA PEMBAYARAN CASH
    return {
      message: 'Pesanan tunai berhasil dibuat',
      data: createdOrder,
    };
  }

  // 👇 FUNGSI BARU: Update Data Order + Hitung Ulang Stok
  async update(id: number, dto: UpdateOrderDto) {
    // 1. Ambil order lama untuk dicek statusnya
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) throw new NotFoundException(`Order #${id} tidak ditemukan`);

    // 2. Cegah update jika pelanggan sudah membayar (Status: PAID)
    // Sesuaikan string 'PAID' jika kamu menggunakan enum lain di Prisma
    if (existingOrder.status === 'PAID') {
      throw new BadRequestException(
        'Pesanan tidak dapat diedit karena pelanggan sudah melakukan pembayaran.',
      );
    }

    // 3. Eksekusi Perubahan dalam Transaksi
    return this.prisma.$transaction(async (tx) => {
      // Jika kasir juga mengubah DAFTAR PESANAN (items)
      if (dto.items && dto.items.length > 0) {
        
        // A. KEMBALIKAN STOK LAMA (Refund stok ke database sementara)
        for (const oldItem of existingOrder.items) {
          await tx.menuItem.update({
            where: { id: oldItem.menuItemId },
            data: { jumlahStock: { increment: oldItem.quantity } },
          });
        }

        // B. SIAPKAN ITEM BARU & HITUNG HARGA
        const newMenuIds = dto.items.map((i) => i.menuItemId);
        const newMenuItems = await tx.menuItem.findMany({
          where: { id: { in: newMenuIds } },
        });

        const menuMap = new Map(newMenuItems.map((m) => [m.id, m]));
        let subtotal = 0;

        const itemsWithPrice = dto.items.map((item) => {
          const menu = menuMap.get(item.menuItemId);
          if (!menu) throw new NotFoundException(`Menu ID #${item.menuItemId} tidak ditemukan`);

          // Validasi stok ulang (setelah stok lama dikembalikan tadi)
          if (menu.jumlahStock < item.quantity) {
            throw new BadRequestException(
              `Gagal update! Stok "${menu.name}" tidak mencukupi. Sisa: ${menu.jumlahStock}`,
            );
          }

          const unitPrice = menu.price;
          subtotal += unitPrice * item.quantity;
          return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice };
        });

        const tax = Math.round(subtotal * TAX_RATE);
        const total = subtotal + tax;

        // C. HAPUS RELASI ITEM LAMA DARI ORDER INI
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // D. POTONG STOK UNTUK ITEM BARU
        for (const newItem of itemsWithPrice) {
          await tx.menuItem.update({
            where: { id: newItem.menuItemId },
            data: { jumlahStock: { decrement: newItem.quantity } },
          });
        }

        // E. UPDATE ORDER DENGAN DATA TOTAL & ITEM TERBARU
        return tx.order.update({
          where: { id },
          data: {
            customerName: dto.customerName,
            tableNumber: dto.tableNumber,
            notes: dto.notes,
            paymentMethod: dto.paymentMethod,
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
          include: { items: { include: { menuItem: true } } },
        });
      }

      // Jika KASIR HANYA MENGUBAH DATA TEKS (Nama/Meja) TANPA MENGUBAH PESANAN
      return tx.order.update({
        where: { id },
        data: {
          customerName: dto.customerName,
          tableNumber: dto.tableNumber,
          notes: dto.notes,
          paymentMethod: dto.paymentMethod,
        },
        include: { items: { include: { menuItem: true } } },
      });
    });
  }

  async findAll(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as any } : undefined,
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } },
    });
    if (!order) throw new NotFoundException(`Order #${id} tidak ditemukan`);
    return order;
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id); 
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: { include: { menuItem: true } } },
    });
  }

// 👇 FUNGSI BARU: Generator PDF bergaya Receiptify (FINAL FIX)
  async generateReceiptPdf(orderId: number): Promise<Buffer> {
    const restoName = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { namaRestoran: true },
    }).then(user => user?.namaRestoran || 'RESTO ANDA');

    // 1. Ambil data order lengkap
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} tidak ditemukan`);
    }

    const PDFDocument = require('pdfkit');

    // 2. Buat file PDF
    return new Promise((resolve, reject) => {
      // Lebar kertas 320, Margin 20. Ruang cetak = 280.
      // 42 Karakter Courier size 10 hanya butuh 252 poin (Pasti muat & tidak auto-wrap!)
      const doc = new PDFDocument({ size: [300, 700], margin: 20 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // ==========================================
      // PENGATURAN FONT & HELPER UNTUK MONOSPACE
      // ==========================================
      const LINE_LEN = 42; 
      doc.font('Courier').fontSize(10); 

      const center = (text: string) => {
        const pad = Math.max(0, Math.floor((LINE_LEN - text.length) / 2));
        return ' '.repeat(pad) + text;
      };

// 👇 HELPER YANG DI-UPGRADE: Mendukung ukuran & opsi PDFKit
      const printLine = (text: string, isBold: boolean = false, size: number = 10, options: any = {}) => {
        if (isBold) {
          doc.font('Courier-Bold').fontSize(size);
        } else {
          doc.font('Courier').fontSize(size);
        }
        doc.text(text, options);
      };

      const justify = (left: string, right: string) => {
        const space = Math.max(0, LINE_LEN - left.length - right.length);
        return left + ' '.repeat(space) + right;
      };

      // ==========================================
      // HEADER
      // ==========================================
      printLine("Warung Saffron"), true, 20, {align: 'center'});

      doc.moveDown(0.5); // Spasi kecil sebelum tabel item

      // ORDER INFO
      const orderIdStr = order.id.toString().padStart(4, '0');
      printLine(`ORDER #${orderIdStr} FOR ${order.customerName.toUpperCase()}`);
      
      doc.moveDown(1); // Spasi kecil sebelum tanggal

      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }).toUpperCase();
      printLine(dateStr);


      
      // ==========================================
      // TABEL ITEM
      // ==========================================
      printLine('-'.repeat(LINE_LEN));
      printLine('QTY  ITEM                            PRICE');
      printLine('-'.repeat(LINE_LEN));

      let totalQty = 0;
      
      order.items.forEach((item) => {
        totalQty += item.quantity;
        const qty = item.quantity.toString().padStart(2, '0');
        const name = item.menuItem.name.toUpperCase();
        // Format harga tanpa "Rp" agar rata kanan presisi
        const priceStr = (item.unitPrice * item.quantity).toLocaleString('id-ID'); 
        
        // Hitung batas panjang nama item agar tidak menabrak harga
        const maxNameLen = LINE_LEN - 5 - priceStr.length - 1; 
        
        if (name.length <= maxNameLen) {
          printLine(`${qty}   ${name}`.padEnd(LINE_LEN - priceStr.length) + priceStr);
        } else {
          // Jika nama terlalu panjang, potong secara manual
          const firstLine = name.substring(0, maxNameLen);
          printLine(`${qty}   ${firstLine}`.padEnd(LINE_LEN - priceStr.length) + priceStr);
          
          let remaining = name.substring(maxNameLen);
          while (remaining.length > 0) {
            const chunk = remaining.substring(0, maxNameLen);
            printLine(`     ${chunk}`); 
            remaining = remaining.substring(maxNameLen);
          }
        }
      });

      // ==========================================
      // TOTALS
      // ==========================================
      printLine('-'.repeat(LINE_LEN));
      printLine(justify('ITEM COUNT:', totalQty.toString()));
      if (order.tax > 0) {
        printLine(justify('SUBTOTAL:', order.subtotal.toLocaleString('id-ID')));
        printLine(justify('TAX:', order.tax.toLocaleString('id-ID')));
      }
      printLine(justify('TOTAL:', order.total.toLocaleString('id-ID')));
      printLine('-'.repeat(LINE_LEN));

      // ==========================================
      // PAYMENT & FOOTER
      // ==========================================
      printLine(`PAYMENT METHOD: ${order.paymentMethod.toUpperCase()}`);
      printLine(`TABLE NUMBER: ${order.tableNumber}`);
      printLine(`CUSTOMER: ${order.customerName.toUpperCase()}`);      

      doc.moveDown(2);

      printLine(center('THANK YOU FOR VISITING!'), true);
      printLine(center('|||||| OrderEase  ||||||'), true);

      doc.end();
    });
  }
}
