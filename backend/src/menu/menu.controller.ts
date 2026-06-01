// src/menu/menu.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, ParseBoolPipe, DefaultValuePipe, UseGuards} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiBearerAuth() // 👈 TAMBAHKAN HANYA DI SINI
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createMenuDto: CreateMenuDto) {
    const data = await this.menuService.create(createMenuDto);
    // 👇 Response sukses yang rapi
    return {
      success: true,
      message: 'Menu berhasil ditambahkan!',
      data: data,
    };
  }

  @Get()
  findAll(
    @Query('availableOnly', new DefaultValuePipe(true), ParseBoolPipe) availableOnly: boolean
  ) {
    return this.menuService.findAll(availableOnly);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth() // 👈 TAMBAHKAN HANYA DI SINI
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto
  ) {
    const data = await this.menuService.update(id, updateMenuDto);
    // 👇 Response sukses yang rapi
    return {
      success: true,
      message: `Menu #${id} berhasil diupdate!`,
      data: data,
    };
  }

  @Delete(':id')
  @ApiBearerAuth() // 👈 TAMBAHKAN HANYA DI SINI
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuService.remove(id);
    // 👇 Response sukses yang rapi
    return {
      success: true,
      message: `Menu #${id} berhasil dihapus permanen!`,
      data: data,
    };
  }
}