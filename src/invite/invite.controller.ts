import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';

@Controller('api/invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('/create')
  create(@Body() body) {
    return this.inviteService.create(body);
  }

  @Post('/accept')
  accept(
    @Query('token') token: string,
    @Body() body: { name: string; password: string },
  ) {
    return this.inviteService.accept(token, body.name, body.password);
  }

  @Get('/get-all')
  findAll(@Query() query, @Headers() headers) {
    return this.inviteService.findAll(query.branchId, headers.company);
  }

  @Delete('/delete')
  delete(@Query('id') id: number) {
    return this.inviteService.delete(id);
  }
}
