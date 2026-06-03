import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XenditService } from './xendit.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateXenditDto } from './dto/create-xendit.dto';
import { XenditWebhookDto } from './dto/xendit-webhook.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Payment')
@Controller('api/payment')
export class XenditController {
  constructor(
    private readonly xenditService: XenditService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('checkout')
  @ApiOperation({ summary: 'Membuat link pembayaran Xendit' })
  async createPayment(@Body() body: CreateXenditDto) {
    const invoice = await this.xenditService.createInvoice(body);

    return {
      message: 'Berhasil membuat tagihan',
      checkout_url: invoice.invoice_url,
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Menerima notifikasi otomatis dari Xendit' })
  @ApiBody({ type: XenditWebhookDto }) 
  async handleWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() body: any, // Tetap gunakan any untuk body aktual karena payload Xendit sangat besar
  ) {
    const validToken = this.configService.get<string>('XENDIT_CALLBACK_TOKEN');

    // 1. Validasi Keamanan Token Callback
    if (callbackToken !== validToken) {
      throw new UnauthorizedException('Token webhook tidak valid');
    }

    const orderId = parseInt(body.external_id, 10);

    // 2. LOGIKA KETIKA PEMBAYARAN LUNAS (PAID / SETTLED)
    if (body.status === 'PAID' || body.status === 'SETTLED') {
      console.log(`Pesanan ${body.external_id} LUNAS sebesar Rp ${body.amount.toLocaleString('id-ID')}`);

      try {
        // 🔍 Proteksi Ganda (Idempotency): Cek status pesanan saat ini di database
        const existingOrder = await this.prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!existingOrder) {
          console.warn(`⚠️ Webhook Diabaikan: Order #${orderId} tidak ditemukan di database.`);
          return { message: 'Order not found' };
        }

        if (existingOrder.status === 'PAID') {
          console.log(`ℹ️ Webhook Diabaikan: Order #${orderId} sudah berstatus PAID sebelumnya.`);
          return { message: 'Webhook already processed' };
        }

        // 📝 Update status ke PAID jika status sebelumnya masih PENDING
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });

        console.log(`✅ Database Berhasil Diperbarui: Status Order #${body.external_id} sekarang PAID!`);
      } catch (error) {
        console.error(`❌ Gagal memperbarui database untuk Order #${body.external_id}:`, (error as any).message);
      }
    } 
    
    // 3. LOGIKA KETIKA TAGIHAN KEDALUWARSA (EXPIRED)
    else if (body.status === 'EXPIRED') {
      console.log(`⚠️ Tagihan Xendit untuk Order #${body.external_id} telah KEDALUWARSA.`);

      try {
        const existingOrder = await this.prisma.order.findUnique({
          where: { id: orderId }
        });

        // Hanya batalkan jika pesanan memang masih PENDING
        if (existingOrder && existingOrder.status === 'PENDING') {
          await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }, // Mengubah status menjadi CANCELLED sesuai enum Anda
          });
          console.log(`🚫 Database Berhasil Diperbarui: Order #${body.external_id} otomatis dibatalkan.`);
        }
      } catch (error) {
        console.error(`❌ Gagal membatalkan Order #${body.external_id}:`, (error as any).message);
      }
    }

    // Selalu kembalikan respon sukses (HTTP 201/200) agar Xendit tahu kirimannya sukses berlabuh
    return { message: 'Webhook received and processed safely' };
  }
}