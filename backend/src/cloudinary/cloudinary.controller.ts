import { 
  Controller, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  ParseIntPipe, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuService } from '../menu/menu.service';
import { UpdateMenuDto } from '../menu/dto/update-menu.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image')) // 👈 'image' adalah nama KEY field form-data saat upload
  @ApiConsumes('multipart/form-data') // 👈 Beritahu Swagger kalau ini form-data
  @ApiOperation({ summary: 'Update menu beserta gambar baru (Admin Only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @UploadedFile() file?: Express.Multer.File, // 👈 Menerima file gambar jika ada
  ) {
    const data = await this.menuService.update(id, updateMenuDto, file);
    return {
      success: true,
      message: 'Menu berhasil diperbarui',
      data,
    };
  }
}