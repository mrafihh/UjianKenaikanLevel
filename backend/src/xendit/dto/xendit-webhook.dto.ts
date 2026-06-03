// src/xendit/dto/xendit-webhook.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class XenditWebhookDto {
  @ApiProperty({ description: 'ID Invoice asli dari Xendit', example: 'inv_8374928374' })
  id!: string;

  @ApiProperty({ description: 'ID Pesanan kita (dari orderId)', example: '1' })
  external_id!: string;

  @ApiProperty({ description: 'Status pembayaran dari Xendit', example: 'PAID' })
  status!: string;

  @ApiProperty({ description: 'Jumlah yang berhasil dibayar', example: 50000 })
  paid_amount!: number;
}