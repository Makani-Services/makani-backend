import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { isValidUUID } from 'src/core/common/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketService } from './ticket.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/ticket')
export class TicketController {
  constructor(private readonly service: TicketService) { }

  @Get('get_all')
  async getAll(@Query() query: any, @Headers() headers: any) {
    return await this.service.findAll(query.keyword, headers.company);
  }

  @Get('get_one')
  async getOne(@Query() query: any, @Headers() headers: any) {
    return await this.service.getById(Number(query.ticketId), headers.company);
  }

  @Post('save')
  async save(@Body() body: CreateTicketDto, @Headers() headers: any) {
    return await this.service.save(body, headers.company);
  }

  @Post('update')
  async update(@Body() body: UpdateTicketDto) {
    return await this.service.updateTicket(body);
  }

  @Post('delete')
  async delete(@Body() body: { ticketId: number }) {
    return await this.service.delete(body.ticketId);
  }

  @Post('attach')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const company = req.headers['company'];
          const destinationPath = `public/${company}/uploads`;
          cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
          const utf8Name = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          try {
            file.originalname = decodeURIComponent(utf8Name);
          } catch {
            file.originalname = utf8Name; // leave as-is if not URL-encoded
          }

          const uniqueSuffix = new Date().getTime().toString();

          const lastDotIndex = file.originalname.lastIndexOf('.');
          let fileNameWithoutExtension = file.originalname.substring(
            0,
            lastDotIndex,
          );
          const fileNameExtension = file.originalname.substring(
            lastDotIndex + 1,
          );

          if (
            fileNameWithoutExtension.includes('rn_image_picker_lib_temp') ||
            isValidUUID(fileNameWithoutExtension)
          ) {
            fileNameWithoutExtension = new Date().getTime().toString();
          }
          const newFilename = `${fileNameWithoutExtension}-${uniqueSuffix}.${fileNameExtension}`;

          cb(null, newFilename);
        },
      }),
    }),
  )
  async uploadAttachments(
    @Body() body: { ticketId: string },
    @Headers() headers: any,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 20,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return await this.service.uploadAttachments(
      Number(body.ticketId),
      files,
      headers.company,
    );
  }
}
