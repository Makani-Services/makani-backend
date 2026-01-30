import {
	Controller,
	Get,
	Patch,
	Body,
	Param,
	Query,
	Headers,
	UseGuards,
} from '@nestjs/common';
import { WoCustomerService } from './wo-customer.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/wo-customer')
export class WoCustomerController {
	constructor(private readonly woCustomerService: WoCustomerService) { }

	// @Get()
	// findAll(@Query() query: any, @Headers() headers: any) {
	// 	return this.woCustomerService.findAll(query, headers);
	// }

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateDto: any,
		@Headers() headers: any,
	) {
		return this.woCustomerService.update(id, updateDto);
	}
}
