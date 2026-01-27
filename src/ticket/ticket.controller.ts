import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './ticket.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/ticket')
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Get('get_all')
  async getAll(@Query() query: any, @Headers() headers: any) {
    return await this.service.findAll(query.keyword, headers.company);
  }

  @Get('get_one')
  async getOne(@Query() query: any, @Headers() headers: any) {
    return await this.service.getById(Number(query.ticketId), headers.company);
  }

  @Post('save')
  async save(@Body() body: CreateTicketDto) {
    return await this.service.save(body);
  }

  @Post('update')
  async update(@Body() body: UpdateTicketDto) {
    return await this.service.updateTicket(body);
  }

  @Post('delete')
  async delete(@Body() body: { ticketId: number }) {
    return await this.service.delete(body.ticketId);
  }
}
