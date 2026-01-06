import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { KeywordService } from './keyword.service';

@Controller('api/keyword')
export class KeywordController {
  constructor(private readonly service: KeywordService) {}

  @Get('get_all')
  async getAll(@Query() query: any) {
    return await this.service.findAll(query.userId, query.count);
  }

  @Post('save')
  async save(@Body() body: any) {
    return await this.service.save(body.userId, body.keyword);
  }
}
