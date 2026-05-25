// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // Load .env otomatis di semua module
    ConfigModule.forRoot({ isGlobal: true }),
    MenuModule,
    OrdersModule,
  ],
})
export class AppModule {}