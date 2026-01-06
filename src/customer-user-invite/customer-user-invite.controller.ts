import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
} from '@nestjs/common';
import { CustomerUserInviteService } from './customer-user-invite.service';
import { CreateCustomerUserInviteDto } from './dto/create-customer-user-invite.dto';
import { UpdateCustomerUserInviteDto } from './dto/update-customer-user-invite.dto';

@Controller('api/customer-user-invite')
export class CustomerUserInviteController {
  constructor(
    private readonly customerUserInviteService: CustomerUserInviteService,
  ) {}

  @Post('/create')
  async create(
    @Body() createCustomerUserInviteDto: CreateCustomerUserInviteDto,
    @Headers() headers,
  ) {
    return await this.customerUserInviteService.create(
      createCustomerUserInviteDto,
      headers.company,
    );
  }

  @Get('/get-all')
  async findAll(
    @Query('customerId') customerId: number,
    @Query('locationId') locationId?: number,
  ) {
    return await this.customerUserInviteService.findAll(customerId, locationId);
  }

  @Get('/find-by-token')
  async findByToken(@Query('token') token: string) {
    return await this.customerUserInviteService.findByToken(token);
  }

  // @Post('accept/:token')
  // @HttpCode(HttpStatus.OK)
  // async acceptInvite(
  //   @Param('token') token: string,
  //   @Body() body: { name: string; email: string },
  // ) {
  //   return await this.customerUserInviteService.acceptInvite(
  //     token,
  //     body.name,
  //     body.email,
  //   );
  // }

  @Get('accept')
  async acceptInviteByQuery(
    @Query('token') token: string,
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('password') password: string,
  ) {
    return await this.customerUserInviteService.acceptInvite(
      token,
      name,
      email,
      password,
    );
  }

  // @Post('repeat')
  // async repeatInvite(@Body() body: { id: number }) {
  //   return await this.customerUserInviteService.repeatInvite(body.id);
  // }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerUserInviteDto: UpdateCustomerUserInviteDto,
  ) {
    return await this.customerUserInviteService.update(
      +id,
      updateCustomerUserInviteDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.customerUserInviteService.remove(+id);
  }
}
