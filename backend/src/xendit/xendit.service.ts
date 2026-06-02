import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

@Injectable()
export class XenditService {
  constructor(private configService: ConfigService) {}

  async createInvoice(orderData: any) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    // 💡 Tentukan URL Frontend Anda.
    // Praktik terbaik: Ambil dari .env agar dinamis saat di-deploy ke produksi.
    // Jika tidak ada di .env, default ke localhost:3000.
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const returnUrl = `${frontendUrl}/kasir`; 

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.xendit.co/v2/invoices',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        data: {
          external_id: orderData.orderId.toString(),
          amount: orderData.amount,
          description: `Pembayaran Pesanan Restoran #${orderData.orderId}`,
          customer: {
            given_names: orderData.customerName,
            email: orderData.customerEmail,
          },
          // 👇 LOGIKA URL REDIRECT (FRONTEND POP-UP TRIGGER) DITAMBAHKAN DI SINI 👇
          success_redirect_url: `${returnUrl}?payment=success&order_id=${orderData.orderId}`,
          failure_redirect_url: `${returnUrl}?payment=failed&order_id=${orderData.orderId}`,
        },
      });
      return response.data;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Xendit Error:', error.response?.data || error.message);
      } else {
        console.error('Unknown Error:', error);
      }
      
      throw new HttpException('Gagal memproses pembayaran ke Xendit', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}