import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { WoAdminNoteService } from './wo-adminnote.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/wo-admin-note')
export class WoAdminNoteController {
  constructor(private readonly woAdminNoteService: WoAdminNoteService) { }

  @Post()
  create(@Body() createDto: any) {
    return this.woAdminNoteService.create(createDto);
  }

  @Get()
  findAll(@Query('woId') woId?: string) {
    if (woId) {
      return this.woAdminNoteService.findAll(+woId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.woAdminNoteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.woAdminNoteService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.woAdminNoteService.remove(+id);
  }
}
