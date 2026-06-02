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
  @ApiOperation({ summary: 'Membuat link pembayaran Xendit' }) // 
  async createPayment(@Body() body: CreateXenditDto) {
    const invoice = await this.xenditService.createInvoice(body);

    return {
      message: 'Berhasil membuat tagihan',
      checkout_url: invoice.invoice_url,
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Menerima notifikasi otomatis dari Xendit' })
  @ApiBody({ type: XenditWebhookDto }) // 👈 Memberi tahu Swagger bentuk payload Webhook
  async handleWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() body: any, // Tetap gunakan any untuk body aktual karena payload Xendit sangat besar
  ) {
    const validToken = this.configService.get<string>('XENDIT_CALLBACK_TOKEN');

    if (callbackToken !== validToken) {
      throw new UnauthorizedException('Token webhook tidak valid');
    }

    if (body.status === 'PAID' || body.status === 'SETTLED') {
      // 💡 Ganti body.paid_amount menjadi body.amount
      console.log(`Pesanan ${body.external_id} LUNAS sebesar Rp ${body.amount.toLocaleString('id-ID')}`);

      try {
        await this.prisma.order.update({
          where: {
            id: parseInt(body.external_id, 10)
          },
          data: {
            status: 'PAID'
          },
        });

        console.log(`✅ Database Berhasil Diperbarui: Status Order #${body.external_id} sekarang PAID!`);
      } catch (error) {
        // 👈 3. SOLUSI ERROR.MESSAGE: Lakukan casting (error as any) agar TypeScript mengizinkan akses properti .message
        console.error(`❌ Gagal memperbarui database untuk Order #${body.external_id}:`, (error as any).message);
      }
    }

    return { message: 'Webhook received' };
  }
}