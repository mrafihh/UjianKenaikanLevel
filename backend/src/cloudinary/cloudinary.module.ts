import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Export agar bisa di-import oleh MenuModule
})
export class CloudinaryModule {}