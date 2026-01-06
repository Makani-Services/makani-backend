import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerNoteService } from './customer-note.service';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';

@Controller('api/customer-note')
export class CustomerNoteController {
  constructor(private readonly customerNoteService: CustomerNoteService) {}

  @Post('/create')
  create(@Body() createCustomerNoteDto: CreateCustomerNoteDto) {
    return this.customerNoteService.create(createCustomerNoteDto);
  }

  @Get()
  findAll() {
    return this.customerNoteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerNoteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerNoteDto: UpdateCustomerNoteDto,
  ) {
    return this.customerNoteService.update(+id, updateCustomerNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerNoteService.remove(+id);
  }
}
