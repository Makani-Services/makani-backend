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
import { WoTechNoteService } from './wo-technote.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/wo-tech-note')
export class WoTechNoteController {
  constructor(private readonly woTechNoteService: WoTechNoteService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.woTechNoteService.create(createDto);
  }

  @Get()
  findAll(@Query('woId') woId?: string) {
    if (woId) {
      return this.woTechNoteService.findAll(+woId);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.woTechNoteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.woTechNoteService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.woTechNoteService.remove(+id);
  }
}
