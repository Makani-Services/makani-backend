import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer/interceptors';
import { diskStorage } from 'multer';
import { UseInterceptors } from '@nestjs/common/decorators';

import { PoItemService } from './poitem.service';
import { CreatePoItemDto } from './dto/create-poitem.dto';
import { UpdatePoItemDto } from './dto/update-poitem.dto';

import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/poitem')
export class PoItemController {
  constructor(private readonly poItemService: PoItemService) {}

  @Post('/create_poitem')
  create(@Body() createPOItemDto: CreatePoItemDto) {
    return this.poItemService.create(createPOItemDto);
  }

  // @Get('/get_all')
  // getAll() {
  //   return this.poItemService.findWorkOrder();

  @Post('/update')
  update(@Body() body: any) {
    const id = body.id as number;
    const data = body.data as UpdatePoItemDto;
    return this.poItemService.update(id, data);
  }

  @Post('attach')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        // destination: 'public/uploads',
        destination: (req, file, cb) => {
          const company = req.headers['company'];
          const destinationPath = `public/${company}/uploads`;
          cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );
          // Generate a custom filename here

          const uniqueSuffix = new Date().getTime().toString();

          // Use the original filename provided by the client with the unique identifier appended
          const originalFilenameParts = file.originalname.split('.');
          const fileExtension = originalFilenameParts.pop();
          const newFilename = `${originalFilenameParts.join(
            '.',
          )}-${uniqueSuffix}.${fileExtension}`;

          cb(null, newFilename);
        },
      }),
    }),
  )
  uploadFile(
    @Body() body: { id: string },
    @UploadedFiles(
      new ParseFilePipeBuilder()
        // .addFileTypeValidator({
        //   // fileType: /(jpg|jpeg|png|gif|jfif)$/,
        //   fileType: '.(png|jpeg|jpg)',
        // })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.poItemService.uploadFile(file.filename, Number(body.id));
  }
}
