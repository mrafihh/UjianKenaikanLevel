import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';

// PartialType otomatis membuat semua isian di atas menjadi opsional (boleh diisi sebagian)
export class UpdateMenuDto extends PartialType(CreateMenuDto) {}