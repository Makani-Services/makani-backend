import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
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

import { PoService } from './po.service';
import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/po')
export class PoController {
  constructor(private readonly poService: PoService) {}

  // @Post('/create')
  // create(@Body() createPoDto: CreatePoDto) {
  //   console.log('createPoDto: ', createPoDto);
  //   return this.poService.create(createPoDto);
  // }

  @Post('/create')
  create(@Body() body, @Headers() headers: any) {
    return this.poService.create(body, headers.company);
  }

  @Get('/get')
  getAll(@Query() query: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    const pageNumber = query.pageNumber;
    const criteria = query.criteria;
    const sort = query.sort;
    const status = query.status ? query.status : 0;

    console.log('🚀 ~ PoController ~ generateExcelFile ~ criteria:', query);

    return this.poService.findAll(
      userId,
      branchId,
      keyword,
      pageNumber,
      status,
      criteria,
      sort,
    );
  }

  @Get('/generate_excel_file')
  async generateExcelFile(@Query() query: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    const criteria = query.criteria;
    const sort = query.sort;
    const status = query.status ? query.status : 0;

    let ordersForExcel = await this.poService.findAll(
      userId,
      branchId,
      keyword,
      null,
      status,
      criteria,
      sort,
    );

    return await this.poService.generateExcelFile(ordersForExcel, userId);
  }

  @Get('/get_all')
  getAllByWo(@Query() query: any) {
    const woId = query.woId;
    return this.poService.findByWoId(woId);
  }

  @Get('/get_one')
  getOneById(@Query() query: any) {
    const poId = query.poId;
    return this.poService.findOneById(poId);
  }

  @Get('/getOrderById')
  getAllById(@Query() query: any) {
    const poId = query.poId;
    return this.poService.findByPoId(poId);
  }

  // BEGIN: REMOVE THIS CODE SOME TIME LATER
  @Get('/getPoCountByWoId')
  getPoCountByWoId(@Query() query: any) {
    const woId = query.woId;
    return this.poService.getPoCountByWoId(woId);
  }
  // END: REMOVE THIS CODE SOME TIME LATER

  @Post('/update')
  update(@Body() body: any, @Headers() headers: any) {
    const id = body.id as number;
    const data = body.data as UpdatePoDto;
    const eventUser = body.eventUser; //to save history
    return this.poService.update(id, data, headers.company, eventUser);
  }

  @Post('/upload_attachment')
  upload(@Body() body: any, @Headers() headers: any) {
    const poId = body.id;
    const name = body.name;
    const base64 = body.base64;
    return this.poService.upload(poId, name, base64, headers.company);
  }

  @Get('/generate-po-receipt')
  generatePOReceipt(@Query() query: any, @Headers() headers: any) {
    const poId = query.poId;
    return this.poService.generatePOReceipt(poId, headers.company);
  }

  @Get('/delete_attachment')
  deleteAttachment(@Query() query: any, @Headers() headers: any) {
    const poId = query.poId;
    const attachmentIndex = query.index;
    const company = headers['company'];
    return this.poService.deleteAttachment(poId, attachmentIndex, company);
  }

  @Get('/getAllOrderNumberWithKeyword')
  getAllOrderNumberWithKeyword(@Query() query: any) {
    return this.poService.getAllOrderNumberWithKeyword(
      query.keyword,
      Number(query.branchId),
    );
  }

  @Get('/deleteByID')
  deleteWorkOrderByID(@Query() query: any, @Headers() headers: any) {
    const id = query.id;
    return this.poService.deletePurchaseOrderByID(id, headers.company);
  }

  @Post('attach')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const company = req.headers['company'];
          const destinationPath = `public/${company}/poreceipt`;
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 20,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.poService.uploadFile(file.filename, Number(body.id));
  }
}
