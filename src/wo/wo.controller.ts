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

import { WoService } from './wo.service';
import { CreateWoDto } from './dto/create-wo.dto';
import { UpdateWoDto } from './dto/update-wo.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { isValidUUID } from 'src/core/common/common';
import * as path from 'path';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/wo')
export class WoController {
  constructor(private readonly woService: WoService) {}

  // @Permissions(['WO:CREATE'])
  @Post('/create_wo')
  create(@Body() createWoDto: CreateWoDto, @Headers() headers: any) {
    return this.woService.create(createWoDto, headers.company);
  }

  // @Permissions(['WO:READ'])
  @Get('/get_all')
  getAll(@Query() query: any, @Headers() headers: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    const pageNumber = query.pageNumber;
    const criteria = query.criteria;
    const sort = query.sort;
    const status = query.status ? query.status : 0;
    const locationId = query.locationId;

    return this.woService.findWorkOrder(
      userId,
      branchId,
      keyword,
      pageNumber,
      status,
      criteria,
      sort,
      locationId,
      headers.company,
    );
  }

  @Get('/get_wos_for_calendar')
  getWOsForCalendar(@Query() query: any, @Headers() headers: any) {
    return this.woService.getWOsForCalendar(
      query.view,
      Number(query.year),
      Number(query.month),
      Number(query.weekNumber),
      query.branch,
    );
  }

  @Get('/get_wos_for_calendar_by_technician')
  getWOsForCalendarByTechnician(@Query() query: any, @Headers() headers: any) {
    return this.woService.getWOsForCalendarByTechnician(
      query.view,
      Number(query.year),
      Number(query.month),
      Number(query.weekNumber),
      query.branchId,
      query.userId,
    );
  }

  @Get('/generate_excel_file')
  async generateExcelFile(@Query() query: any, @Headers() headers: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    const criteria = query.criteria;
    const sort = query.sort;
    const status = query.status ? query.status : 0;
    const locationId = query.locationId;
    let ordersForExcel = await this.woService.findWorkOrder(
      userId,
      branchId,
      keyword,
      null,
      status,
      criteria,
      sort,
      locationId,
      headers.company,
    );
    return await this.woService.generateExcelFile(ordersForExcel, userId);
  }

  @Get('/get_recommendations')
  getRecommendations(@Query() query: any, @Headers() headers: any) {
    const keyword = query.keyword;
    const branchId = query.branchId;
    const pageNumber = query.pageNumber;
    const status = query.status ? query.status : 0;
    return this.woService.findAllRecommendations(
      keyword,
      branchId,
      pageNumber,
      status,
      headers.company,
    );
  }

  @Get('/get_recommendations_by_customer')
  getRecommendationsByCustomer(@Query() query: any, @Headers() headers: any) {
    const customerId = query.customerId;
    const locationId = query.locationId;
    const pageNumber = query.pageNumber;
    return this.woService.findAllRecommendationsByCustomer(
      headers.company,
      customerId,
      locationId,
      pageNumber,
    );
  }

  // @Permissions(['WO:READ'])
  @Get('/get_assigned')
  getAssigned(@Query() query: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    return this.woService.findAssignedOrders(userId, branchId, keyword);
  }

  // @Permissions(['WO:READ'])
  @Get('/get_requested')
  getRequested(@Query() query: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    return this.woService.findRequestedOrders(userId, branchId);
  }

  // @Permissions(['WO:READ'])
  @Get('/get_past')
  getPast(@Query() query: any) {
    const userId = query.userId;
    const branchId = query.branchId;
    const keyword = query.keyword;
    return this.woService.findPastOrders(userId, branchId, keyword);
    // return this.woService.findPastOrders(userId, branchId);
  }

  @Get('/getById')
  getOrderById(@Query() query: any) {
    const id = query.id;
    return this.woService.findOrderById(id);
  }

  @Get('/getBasicWoById')
  getBasicWOOrderById(@Query() query: any) {
    const id = query.id;
    return this.woService.findBasicWorkOrdersById(id);
  }

  @Get('/getByNumber')
  getOrderByNumber(@Query() query: any) {
    const number = query.number;
    return this.woService.findWorkOrderByNumber(number);
  }

  @Get('/getAllOrderNumber')
  getAllOrderNumber(@Query() query: any) {
    let branchId = query.branchId;
    return this.woService.getAllOrderNumber(branchId);
  }

  @Get('/getAllOrderNumberWithKeyword')
  getAllOrderNumberWithKeyword(@Query() query: any) {
    return this.woService.getAllOrderNumberWithKeyword(
      query.keyword,
      Number(query.branchId),
    );
  }

  @Get('/check_wo_number_duplicate')
  checkWoNumberDuplicate(@Query() query: any, @Headers() headers: any) {
    return this.woService.checkWoNumberDuplicate(query.number, headers.company);
  }

  // @Permissions(['WO:CREATE'])
  // @Post('/assign_tech')
  // assignTech(@Body() body: any) {
  //   return this.woService.assignTech(body.id, body.data);
  // }

  // @Permissions(['WO:CREATE'])
  @Post('/update')
  update(@Body() body: any, @Headers() headers: any) {
    const id = body.id as number;
    const data = body.data as UpdateWoDto;
    console.log('🚀 ~ WoController ~ update ~ data:', body.data);
    return this.woService.update(id, data, headers.company);
  }

  @Get('/deleteByID')
  deleteWorkOrderByID(@Query() query: any, @Headers() headers: any) {
    const id = query.id;
    return this.woService.deleteWorkOrderByID(id, headers.company);
  }

  //attach materials. this should be done by technician
  // @Permissions(['WO:CREATE'])
  @Post('/attach_materials')
  attachMaterials(@Body() body: any, @Headers() headers: any) {
    const id = body.id;
    const data = body.data;
    const eventUser = body.eventUser;
    return this.woService.attachMaterials(id, data, eventUser, headers.company);
  }

  @Get('/delete_material')
  deleteMaterial(@Query() query: any, @Headers() headers: any) {
    return this.woService.deleteOtherMaterial(
      query.woID,
      query.index,
      headers.company,
    );
  }

  @Post('/update_material')
  updateMaterial(@Body() body: any, @Headers() headers: any) {
    return this.woService.updateOtherMaterial(
      body.woID,
      body.index,
      body.data,
      body.eventUser,
      headers.company,
    );
  }

  @Get('/preview_serviceticket')
  previewServiceTicket(@Query() query: any, @Headers() headers: any) {
    const id = query.id;
    return this.woService.previewServiceTicket(id, headers.company);
  }

  @Get('/send_serviceticket')
  sendServiceTicket(@Query() query: any, @Headers() headers: any) {
    const id = query.id;
    const stSentDate = query.stSentDate;
    return this.woService.sendServiceTicketEmail(
      id,
      stSentDate,
      headers.company,
    );
  }

  @Get('/delete_attachment')
  deleteAttachment(@Query() query: any, @Headers() headers: any) {
    const woId = query.woId;
    const attachmentIndex = query.index;
    const company = headers['company'];
    const type = query.type;
    return this.woService.deleteAttachment(
      woId,
      attachmentIndex,
      company,
      Number(type),
    );
  }

  @Post('/save_signature')
  saveSignature(@Body() body: any, @Headers() headers: any) {
    const id = body.id;
    const signatureString = body.signature;
    const signerName = body.name;
    const stSignedDate = body.stSignedDate;
    const serviceTicketProvider = body.serviceTicketProvider;
    return this.woService.saveSignature(
      id,
      signerName,
      signatureString,
      stSignedDate,
      serviceTicketProvider,
      headers.company,
    );
  }

  // @Post('/upload_attachment')
  // uploadAttachment(@Body() body: any, @Headers() headers: any) {
  //   const woID = body.woID;
  //   const base64 = body.base64;
  //   return this.woService.uploadAttachment(woID, base64, headers);
  // }

  @Post('/send_wo_report')
  sendOpenWOReport(@Body() body: any, @Headers() headers: any) {
    return this.woService.sendWOReport(
      body.branchId,
      body.recipients,
      body.past7Days,
      body.past30Days,
      body.customDays,
      body.customStartDate,
      body.customEndDate,
      body.date,
      body.type,
      headers.company,
    );
  }

  // @Permissions(['WO:CREATE'])
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
          const utf8Name = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          try {
            file.originalname = decodeURIComponent(utf8Name);
          } catch {
            file.originalname = utf8Name; // leave as-is if not URL-encoded
          }

          // Generate a custom filename here

          const uniqueSuffix = new Date().getTime().toString();

          // Use the original filename provided by the client with the unique identifier appended

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
  uploadMultipleFiles(
    @Body() body: { orderId: string; type: string },
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
    return this.woService.uploadFile(
      files.map((file) => file.filename),
      Number(body.orderId),
      Number(body.type),
    );
  }
}
