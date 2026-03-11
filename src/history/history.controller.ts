import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Controller('api/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @Post()
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get('/getByWoId')
  getAllByWoId(@Query() query: any) {
    const woId = query.woId;
    return this.historyService.getAllByWoId(woId);
  }

  @Get('/get_all_by_wo_id_paginated')
  getAllByWoIdPaginated(@Query() query: any) {
    const woId = query.woId;
    const pageNumber = query.pageNumber;
    return this.historyService.getAllByWoIdPaginated(woId, pageNumber);
  }
}
