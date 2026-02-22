import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
} from '@nestjs/common';
import { WoTagService } from './wo-tag.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/wo-tag')
export class WoTagController {
	constructor(private readonly woTagService: WoTagService) { }

	@Post()
	create(@Body() createDto: any) {
		return this.woTagService.create(createDto);
	}

	@Get()
	findAll() {
		return this.woTagService.findAll();
	}

	@Get('search')
	search(@Query('keyword') keyword: string) {
		return this.woTagService.search((keyword || '').toLowerCase());
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.woTagService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDto: any) {
		return this.woTagService.update(+id, updateDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.woTagService.remove(+id);
	}

	@Post(':id/attachments/:attachmentId')
	addAttachment(
		@Param('id') id: string,
		@Param('attachmentId') attachmentId: string,
	) {
		return this.woTagService.addAttachment(+id, +attachmentId);
	}

	@Delete(':id/attachments/:attachmentId')
	removeAttachment(
		@Param('id') id: string,
		@Param('attachmentId') attachmentId: string,
	) {
		return this.woTagService.removeAttachment(+id, +attachmentId);
	}
}
