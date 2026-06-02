import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'restoku_menu', // Nama folder otomatis di Cloudinary Anda
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Gagal mengunggah gambar ke Cloudinary'));
          resolve(result);
        },
      );

      // Mengubah buffer Multer menjadi stream dan mengirimkannya ke Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}