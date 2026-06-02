import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios'; // 👈 Tambahkan import AxiosError di sini

@Injectable()
export class XenditService {
  constructor(private configService: ConfigService) {}

  async createInvoice(orderData: any) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

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
        },
      });
      return response.data;
      
    } catch (error) { // 👈 Bagian yang diubah
      // Mengecek apakah error ini berasal dari pemanggilan Axios (HTTP request)
      if (axios.isAxiosError(error)) {
        console.error('Xendit Error:', error.response?.data || error.message);
      } else {
        // Jika error berasal dari hal lain (misal syntax error)
        console.error('Unknown Error:', error);
      }
      
      throw new HttpException('Gagal memproses pembayaran ke Xendit', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}