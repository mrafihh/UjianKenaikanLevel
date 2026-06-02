import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XenditService } from './xendit.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateXenditDto } from './dto/create-xendit.dto'; // 👈 Import DTO Checkout
import { XenditWebhookDto } from './dto/xendit-webhook.dto';   // 👈 Import DTO Webhook

@ApiTags('Payment')
@Controller('api/payment')
export class XenditController {
  constructor(
    private readonly xenditService: XenditService,
    private readonly configService: ConfigService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Membuat link pembayaran Xendit' }) // 👈 Tambahan deskripsi Swagger
  async createPayment(@Body() body: CreateXenditDto) { // 👈 Ubah 'any' menjadi 'CreateXenditDto'
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
      console.log(`Pesanan ${body.external_id} LUNAS sebesar ${body.amount}`);
      // Lakukan update database Prisma di sini
    }

    return { message: 'Webhook received' };
  }
}