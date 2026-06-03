// src/xendit/xendit.module.ts
import { Module } from '@nestjs/common';
import { XenditService } from './xendit.service';
import { XenditController } from './xendit.controller';

@Module({
  controllers: [XenditController],
  providers: [XenditService],
  exports: [XenditService], 
})
export class XenditModule {}