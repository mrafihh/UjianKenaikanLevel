// src/menu/menu.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // GET /menu — diakses frontend untuk render halaman menu
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // GET /menu/:id — opsional, untuk detail item
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }
}