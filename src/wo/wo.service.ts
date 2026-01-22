import {
  Injectable,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, getEntityManagerToken } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { fileURLToPath, pathToFileURL } from 'url';
const libre = require('libreoffice-convert');

import { CreateWoDto } from './dto/create-wo.dto';
import { UpdateWoDto } from './dto/update-wo.dto';
import { WoEntity } from './entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import * as htmlPDF from 'html-pdf-node';
import * as nodemailer from 'nodemailer';
import * as _ from 'lodash';
import writeXlsxFile from 'write-excel-file/node';
import {
  API_URL,
  ITEMS_PER_PAGE,
  compressImage,
  getAssignedTechsNameArray,
  getDaysOfWeekByYearMonthWeek,
  getPOReceiptPath,
  getPrimaryAndSecondaryTechs,
  getServiceTicketPath,
  getSignaturePath,
  getThumbnailPath,
  getThumbnailUrl,
  getUploadPath,
  getWorkOrderStatus,
  isImageFile,
  priorityLevels,
  schema,
} from 'src/core/common/common';

import * as moment from 'moment';

import { default as config } from '../config';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import {
  WO_TYPE_LIST,
  formatDate,
  getAvatarUrl,
  getRealFileName,
  getUploadUrl,
  paymentItems,
  getSignatureUrl,
} from 'src/core/common/common';
import { UserService } from 'src/user/user.service';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { BranchService } from 'src/branch/branch.service';
import { PoService } from 'src/po/po.service';
import { CustomerNotificationService } from 'src/customer-notification/customer-notification.service';
import { CustomerNotificationEntity } from 'src/customer-notification/entities/customer-notification.entity';
import { CustomerUserService } from 'src/customer-user/customer-user.service';
import { MaterialService } from 'src/material/material.service';
// import { ModuleRef } from '@nestjs/core';

libre.convertAsync = require('util').promisify(libre.convert);

@Injectable()
export class WoService extends TypeOrmCrudService<WoEntity> {
  constructor(
    @InjectRepository(WoEntity) repo: Repository<WoEntity>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(TechnicianEntity)
    private technicianRepo: Repository<TechnicianEntity>,
    @InjectRepository(PoEntity) private poRepo: Repository<PoEntity>,
    @InjectRepository(PoItemEntity)
    private poItemRepo: Repository<PoItemEntity>,
    @InjectRepository(HistoryEntity)
    private historyRepo: Repository<HistoryEntity>,
    private readonly userService: UserService,
    private readonly pusherService: PusherService,
    private readonly emailService: EmailService,
    private readonly branchService: BranchService,
    private readonly notificationService: NotificationService,
    private readonly companyService: CompanyService, // private moduleRef: ModuleRef
    private readonly historyService: HistoryService,
    private readonly customerNoteService: CustomerNoteService,
    private readonly customerNotificationService: CustomerNotificationService,
    private readonly customerUserService: CustomerUserService,
    private readonly materialService: MaterialService,
  ) {
    super(repo);
  }

  async create(createWoDto: CreateWoDto, company: string) {
    var newWO = new WoEntity(createWoDto);

    //check if work order number is duplicated
    if (newWO.number) {
      const existingWO = await this.repo.findOne({
        where: { number: newWO.number },
      });
      if (existingWO) {
        throw new HttpException(
          'Duplicated work order number',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    let wo = await this.repo.save(newWO);
    wo = await this.findWorkOrderById(wo.id);
    if (wo.status == 0) {
      //if wo is requested, send email notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            0,
            0,
            9,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: `New WO requested from ${wo.customer.companyName}`,
            text: `New WO requested from ${wo.customer.companyName}`,
            html:
              `Customer: ${wo.customer.companyName}` +
              '<br/>' +
              `Description: ${wo.description}` +
              '<br/>' +
              `Priority Level: ${priorityLevels[wo.priorityLevel]}`,
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (e) {
        console.log(e);
      }
      //if wo is requested, send push notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            1,
            0,
            4,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            `New Work Order is requested`,
            `Work Order is requested from ${wo.customer.companyName}`,
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
    if (wo.status == 1) {
      //if wo is issued, send push notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            2,
            0,
            0,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            'Work Order is issued',
            'WO number is ' + newWO.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
    }

    return wo;
  }

  // async findWorkOrder(
  //   userId,
  //   branchId,
  //   keyword,
  //   pageNumber,
  //   status,
  //   criteria,
  //   sort,
  // ) {
  //   let baseQuery = this.repo
  //     .createQueryBuilder('wo')
  //     .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
  //     .leftJoinAndSelect('wo.openUser', 'openUser')
  //     .leftJoinAndSelect('wo.customer', 'customer')
  //     .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
  //     .leftJoinAndSelect('wo.pos', 'pos')
  //     .leftJoinAndSelect('wo.history', 'history')
  //     .leftJoinAndSelect('history.user', 'historyUser')
  //     .leftJoinAndSelect('pos.poItems', 'items')
  //     .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
  //     .leftJoinAndSelect('assignedTechs.user', 'techUser')
  //     .leftJoinAndSelect('wo.branch', 'branch')
  //     .where('wo.status >= :status', { status: status })
  //     .andWhere(
  //       new Brackets((qb) => {
  //         qb.where('wo.number ILike :searchString', {
  //           searchString: `%${keyword}%`,
  //         })
  //           .orWhere('techUser.name ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('customer.company ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('wo.asset ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('wo.customerPONumber ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('wo.servicesProvided ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('wo.description ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           })
  //           .orWhere('wo.recommendations ILike :searchString', {
  //             searchString: `%${keyword}%`,
  //           });
  //       }),
  //     )
  //     .orderBy('wo.createdAt', 'DESC');

  //   //branching
  //   if (branchId != 0) {
  //     baseQuery = baseQuery.andWhere('branch.id = :branchId', { branchId });
  //   }

  //   //filtering
  //   if (criteria && criteria.type >= 0) {
  //     baseQuery = baseQuery.andWhere('wo.type = :type', {
  //       type: criteria.type,
  //     });
  //   }
  //   if (criteria && criteria.customer >= 0) {
  //     baseQuery = baseQuery.andWhere('wo.customer = :customer', {
  //       customer: criteria.customer,
  //     });
  //   }
  //   if (criteria && criteria.tech >= 0) {
  //     baseQuery = baseQuery.andWhere('techUser.id = :id', {
  //       id: criteria.tech,
  //     });
  //   }
  //   if (criteria && criteria.status >= 0) {
  //     baseQuery = baseQuery.andWhere('wo.status= :status', {
  //       status: criteria.status,
  //     });
  //   }
  //   if (criteria && criteria.startDate) {
  //     baseQuery = baseQuery.andWhere('wo.createdAt >= :startDate', {
  //       startDate: criteria.startDate,
  //     });
  //   }
  //   if (criteria && criteria.endDate) {
  //     baseQuery = baseQuery.andWhere('wo.createdAt <= :endDate', {
  //       endDate: criteria.endDate,
  //     });
  //   }
  //   //sorting
  //   if (sort && sort.date) {
  //     if (sort.date == 0) {
  //       baseQuery = baseQuery.orderBy('wo.createdAt', 'DESC');
  //     } else if (sort.date == 1) {
  //       baseQuery = baseQuery.orderBy('wo.createdAt', 'ASC');
  //     }
  //   }

  //   if (pageNumber) {
  //     const totalCount = await baseQuery.getCount();

  //     let temp = await baseQuery
  //       .skip(ITEMS_PER_PAGE * pageNumber)
  //       .take(ITEMS_PER_PAGE)
  //       .getMany();
  //     let orders = temp.map((order) => {
  //       return {
  //         ...order,
  //         startDateString: formatDate(order.startDate, 'MM/DD/YYYY'),
  //       };
  //     });

  //     return {
  //       orders,
  //       totalCount,
  //     };
  //   } else {
  //     let result = await baseQuery.clone().getMany();
  //     console.log('🚀🚀🚀🚀🚀🚀:', result.length);
  //     return result;
  //   }
  // }

  async findWorkOrder(
    userId,
    branchId,
    keyword,
    pageNumber,
    status,
    criteria,
    sort,
    locationId,
    company: string,
  ) {
    let query = this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .leftJoinAndSelect('wo.branch', 'branch')
      .leftJoinAndSelect('wo.quotedBy', 'quotedBy')
      .where('wo.status >= :status', { status: status })
      .andWhere('wo.company = :company', { company: company })
      .andWhere(
        new Brackets((qb) => {
          qb.where('wo.number ILike :searchString', {
            searchString: `%${keyword}%`,
          })
            .orWhere('techUser.name ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('customer.companyName ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.asset ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.customerPONumber ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.servicesProvided ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.description ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.recommendations ILike :searchString', {
              searchString: `%${keyword}%`,
            });
        }),
      )
      .orderBy('wo.createdAt', 'DESC');

    //branching
    if (branchId && branchId != 0) {
      query = query.andWhere('branch.id = :branchId', { branchId });
    }

    //location filtering for customer portal
    if (locationId > 0) {
      query = query.andWhere('wo.customerLocationId = :locationId', {
        locationId,
      });
    }

    //filtering
    if (criteria && criteria.type >= 0) {
      query = query.andWhere('wo.type = :type', {
        type: criteria.type,
      });
    }

    if (criteria && criteria.customer >= 0) {
      query = query.andWhere('wo.customer = :customer', {
        customer: criteria.customer,
      });
    }
    if (criteria && criteria.tech >= 0) {
      query = query.andWhere('techUser.id = :id', {
        id: criteria.tech,
      });
    }
    if (criteria && criteria.status >= 0) {
      query = query.andWhere('wo.status= :status', {
        status: criteria.status,
      });
    }
    if (criteria && criteria.startDate) {
      query = query.andWhere('wo.createdAt >= :startDate', {
        startDate: criteria.startDate,
      });
    }
    if (criteria && criteria.endDate) {
      query = query.andWhere('wo.createdAt <= :endDate', {
        endDate: criteria.endDate,
      });
    }
    if (criteria && criteria.quotedBy >= 0) {
      query = query.andWhere('quotedBy.id = :id', {
        id: criteria.quotedBy,
      });
    }
    //sorting
    if (sort?.date) {
      if (sort?.date == 0) {
        query = query.orderBy('wo.startDate', 'DESC', 'NULLS LAST');
      } else if (sort?.date == 1) {
        query = query.orderBy('wo.startDate', 'ASC', 'NULLS LAST');
      }
    }
    if (sort?.number) {
      if (sort?.number == 0) {
        query = query.orderBy('wo.number', 'DESC', 'NULLS LAST');
      } else if (sort?.number == 1) {
        query = query.orderBy('wo.number', 'ASC', 'NULLS LAST');
      }
    }

    if (pageNumber) {
      const totalCount = await query.getCount();

      let temp = await query
        .skip(ITEMS_PER_PAGE * pageNumber)
        .take(ITEMS_PER_PAGE)
        .getMany();
      let orders = temp.map((order) => {
        return {
          ...order,
          startDateString: order.startDate
            ? formatDate(order.startDate, 'MM/DD/YYYY')
            : '',
        };
      });

      return {
        orders,
        totalCount,
      };
    } else {
      let result = await query.clone().getMany();
      return result;
    }
  }

  async getWOsForCalendar(view, year, month, weekNumber, branch) {
    let startDate, endDate;

    if (view === 'Month') {
      startDate = moment({ year: year, month: month, day: 1 });
      endDate = moment({ year: year, month: month }).endOf('month');
    } else {
      let dayArray = getDaysOfWeekByYearMonthWeek(year, month, weekNumber);

      startDate = moment({ year: year, month: month, day: dayArray[0].day });
      endDate = moment({
        year: year,
        month: month,
        day: dayArray[dayArray.length - 1].day,
      });
    }

    let result = await this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .where('DATE(wo.startDate) >= DATE(:startDate)', {
        startDate: startDate,
      })
      .andWhere('DATE(wo.startDate) <= DATE(:endDate)', { endDate: endDate })
      .andWhere('branch.id = :branch', { branch })
      .getMany();

    result = result.map((order) => {
      return {
        ...order,
        startDateString: order.startDate
          ? formatDate(order.startDate, 'MM/DD/YYYY')
          : '',
      };
    });

    return result;
  }

  async getWOsForCalendarByTechnician(
    view,
    year,
    month,
    weekNumber,
    branchId,
    userId,
  ) {
    let startDate, endDate;

    if (view === 'Month') {
      startDate = moment({ year: year, month: month, day: 1 });
      endDate = moment({ year: year, month: month }).endOf('month');
    } else {
      let dayArray = getDaysOfWeekByYearMonthWeek(year, month, weekNumber);

      startDate = moment({ year: year, month: month, day: dayArray[0].day });
      endDate = moment({
        year: year,
        month: month,
        day: dayArray[dayArray.length - 1].day,
      });
    }

    let result = await this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .where('assignedTechs.user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .andWhere('DATE(wo.startDate) >= DATE(:startDate)', {
        startDate: startDate,
      })
      .andWhere('DATE(wo.startDate) <= DATE(:endDate)', { endDate: endDate })
      .andWhere('branch.id = :branchId', { branchId })
      .getMany();

    result = result.map((order) => {
      return {
        ...order,
        startDateString: order.startDate
          ? formatDate(order.startDate, 'MM/DD/YYYY')
          : '',
      };
    });

    return result;
  }

  async generateExcelFile(ordersForExcel, userId) {
    ordersForExcel = ordersForExcel.map((order) => {
      return {
        ...order,
        startDateString: order.startDate
          ? formatDate(order.startDate, 'MM/DD/YYYY')
          : '',
      };
    });

    let data = [];
    for (let order of ordersForExcel) {
      const row = {
        number: order.number,
        type: order.type == 0 ? 'Service Call' : 'Quoted',
        customer: order.customer?.company,
        NTE: order.NTE,
        description: order.description,
        startDate: order.startDate,
        technician: getAssignedTechsNameArray(order.assignedTechs),
        status: getWorkOrderStatus(order.status),
      };
      data.push(row);
    }
    const fileName = `WOs_report.xlsx`;
    const filePath = `./public/rscs/reports/${userId}/${fileName}`;
    if (!fs.existsSync(`./public/rscs/reports/${userId}`)) {
      fs.mkdirSync(`./public/rscs/reports/${userId}`, { recursive: true });
    }
    await writeXlsxFile(data, {
      schema,
      headerStyle: {
        backgroundColor: '#eeeeee',
        fontWeight: 'bold',
        align: 'center',
      },
      filePath: filePath,
    });

    return true;
  }

  async findRequestedOrders(userId, branchId) {
    return await this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .where('order.status < :status', { status: 6 })
      .andWhere('branch.id = :branchId', { branchId })
      .andWhere('assignedTechs.user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 0,
      })
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async findAssignedOrders(userId, branchId, keyword) {
    // async findAssignedOrders(userId, branchId) {
    let orders = await this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.status < :status', { status: 5 })
      .andWhere('branch.id = :branchId', { branchId })
      // .andWhere('assignedTechs.techStatus = :techStatus', {
      //   techStatus: 0,
      // })
      .andWhere('assignedTechs.user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('order.number ILike :searchString', {
            searchString: `%${keyword}%`,
          })
            .orWhere('customer.companyName ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.asset ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.customerPONumber ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.servicesProvided ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.description ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.recommendations ILike :searchString', {
              searchString: `%${keyword}%`,
            });
        }),
      )
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .orderBy('customer.companyName', 'ASC')
      // .orderBy('order.createdAt', 'DESC')
      .getMany();

    orders = orders.map((order) => {
      return {
        ...order,
        startDateString: order.startDate
          ? formatDate(order.startDate, 'MM/DD/YYYY')
          : '',
      };
    });

    return orders;
  }

  async findPastOrders(userId, branchId, keyword) {
    // async findPastOrders(userId, branchId) {
    return await this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.status >= :status', { status: 5 })
      .andWhere('branch.id = :branchId', { branchId })
      // .orWhere('assignedTechs.techStatus = :techStatus', {
      //   techStatus: 1,
      // })
      .andWhere('assignedTechs.user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('order.number ILike :searchString', {
            searchString: `%${keyword}%`,
          })
            .orWhere('customer.companyName ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.asset ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.customerPONumber ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.servicesProvided ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.description ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('order.recommendations ILike :searchString', {
              searchString: `%${keyword}%`,
            });
        }),
      )
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .orderBy('customer.companyName', 'ASC')
      .getMany();
  }

  async update(id: number, data, company) {
    let wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'branch',
        'customerLocation',
      ],
    });

    //save history
    await this.saveHistory(wo, data);

    //To save the date of status
    if (data.status && data.status == 1) {
      //send push notification to technician(tech app) when work order is issued
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            2,
            0,
            1,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            'Work Order is approved',
            'WO number is ' + wo.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
      //send email notification to customer users when the work order is approved
      try {
        let item: CustomerNotificationEntity =
          await this.customerNotificationService.findOne(
            0,
            0,
            wo.customerLocation.id,
            wo.company,
          );
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'Work Order is issued(approved)',
            text: 'Work Order is issued(approved)',
            html:
              `WO#: ${data.number}` +
              '<br/>' +
              `Type of WO#: ${WO_TYPE_LIST[data.type]}` +
              '<br/>' +
              `Customer Name: ${wo.customer.companyName}` +
              '<br/>' +
              `Description: ${wo.description}` +
              '<br/>' +
              `Technician Assigned:  ${data.assignedTechs
                ? getAssignedTechsNameArray(data.assignedTechs)
                : 'Waiting for Assignment'
              }`,
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (e) {
        console.log(e);
      }
      //send push notification to customer users when the work order is approved
      try {
        let item: CustomerNotificationEntity =
          await this.customerNotificationService.findOne(
            0,
            1,
            wo.customerLocation.id,
            wo.company,
          );
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          console.log(
            '🚀 ~ WoService ~ update ~ recipientEmailArray:',
            recipientEmailArray,
          );
          this.pusherService.sendPushNotificationToCustomer(
            recipientEmailArray,
            'Work Order is issued(approved)',
            'WO number is ' + data.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else if (data.status && data.status == 2) {
      //Enroute
      data.enrouteDate = new Date();
      //send push notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            1,
            0,
            2,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            'Work order status is enroute',
            'Work order number is ' + wo.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else if (data.status && data.status == 3) {
      //Arrived
      data.arrivedDate = new Date();
      //send push notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            1,
            0,
            3,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            'Work order status is arrived',
            'Work order number is ' + wo.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else if (data.status && data.status == 5) {
      //Completed
      data.completedDate = new Date();
      //send email notification to customer users when the work order is completed
      try {
        let item: CustomerNotificationEntity =
          await this.customerNotificationService.findOne(
            1,
            0,
            wo.customerLocation.id,
            wo.company,
          );
        console.log('🚀🚀🚀🚀🚀🚀 ~ WoService ~ update ~ item:', item);
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'Work Order is completed',
            text: 'Work Order is completed',
            html:
              `WO#: ${wo.number}` +
              '<br/>' +
              `Type of WO#: ${WO_TYPE_LIST[wo.type]}` +
              '<br/>' +
              `Customer Name: ${wo.customer.companyName}` +
              '<br/>' +
              `Description: ${wo.description}` +
              '<br/>' +
              `Technician Assigned:  ${wo.assignedTechs
                ? getAssignedTechsNameArray(wo.assignedTechs)
                : 'Waiting for Assignment'
              }`,
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (e) {
        console.log(e);
      }
      //send push notification to customer users when the work order is completed
      try {
        let item: CustomerNotificationEntity =
          await this.customerNotificationService.findOne(
            1,
            1,
            wo.customerLocation.id,
            wo.company,
          );
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          this.pusherService.sendPushNotificationToCustomer(
            recipientEmailArray,
            'Work Order is completed',
            'WO number is ' + wo.number,
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else if (data.status && data.status == 100) {
      //send email notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            0,
            0,
            4,
            wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailList(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'Billed WO# ' + wo.number + ', ' + wo.customer.companyName,
            text: 'Billed WO# ' + wo.number + ', ' + wo.customer.companyName,
            html:
              `WO#: ${wo.number}` +
              '<br/>' +
              `Type of WO#: ${WO_TYPE_LIST[wo.type]}` +
              '<br/>' +
              `Customer Name: ${wo.customer.companyName}` +
              '<br/>' +
              `Description: ${wo.description}` +
              '<br/>' +
              `Technician Assigned: ${getAssignedTechsNameArray(
                wo.assignedTechs,
              )}`,
          };
          this.emailService.sendEmail(mailOptions);
        }

        //send email notification to customer users when the work order is billed
        try {
          let item: CustomerNotificationEntity =
            await this.customerNotificationService.findOne(
              2,
              0,
              wo.customerLocation.id,
              wo.company,
            );
          if (item) {
            let recipientEmailArray =
              await this.customerUserService.getRecipientEmailList(item);
            const mailOptions = {
              from: config.mail.supportEmail,
              to: recipientEmailArray, // list of receivers (separated by ,)
              subject: 'Work Order is billed',
              text: 'Work Order is billed',
              html:
                `WO#: ${wo.number}` +
                '<br/>' +
                `Type of WO#: ${WO_TYPE_LIST[wo.type]}` +
                '<br/>' +
                `Customer Name: ${wo.customer.companyName}` +
                '<br/>' +
                `Description: ${wo.description}` +
                '<br/>' +
                `Technician Assigned:  ${wo.assignedTechs
                  ? getAssignedTechsNameArray(wo.assignedTechs)
                  : 'Waiting for Assignment'
                }`,
            };
            this.emailService.sendEmail(mailOptions);
          }
        } catch (e) {
          console.log(e);
        }
        //send push notification to customer users when the work order is billed
        try {
          let item: CustomerNotificationEntity =
            await this.customerNotificationService.findOne(
              2,
              1,
              wo.customerLocation.id,
              wo.company,
            );
          if (item) {
            let recipientEmailArray =
              await this.customerUserService.getRecipientEmailList(item);
            this.pusherService.sendPushNotificationToCustomer(
              recipientEmailArray,
              'Work Order is billed',
              'WO number is ' + wo.number,
            );
          }
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    }

    // update the timesheet when start date is changed
    if (data.startDate) {
      let dayDiff = moment(wo.startDate)
        .startOf('day')
        .diff(data.startDate, 'days');
      let technicians = await this.technicianRepo.findBy({ wo: { id: wo.id } });
      for (let i = 0; i < technicians.length; i++) {
        let timesheet = JSON.parse(technicians[i].timesheet);
        if (timesheet) {
          for (let j = 0; j < timesheet.length; j++) {
            timesheet[j].dayDiff += dayDiff;
          }
          technicians[i].timesheet = JSON.stringify(timesheet);
          await this.technicianRepo.save(technicians[i]);
        }
      }
    }

    //status is not changed. only information is updated.
    // if (!data.status) {
    //Send email notification with updated information
    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        0,
        0,
        2,
        wo.branch.id,
        company,
      );
      if (item) {
        let recipientEmailArray = await this.userService.getRecipientEmailArray(
          item,
        );

        let updatedHTML = '<b>Updated Information:</b>' + '<br/>';
        if (data.number)
          updatedHTML +=
            `${data.eventUser.name} changed the number from ${wo.number} to ${data.number}` +
            '<br/><br/>';
        if (data.status)
          updatedHTML +=
            `${data.eventUser.name
            } changed the status from ${getWorkOrderStatus(
              wo.status,
            )} to ${getWorkOrderStatus(data.status)}` + '<br/><br/>';
        if (data.customer)
          updatedHTML +=
            `${data.eventUser.name} changed the Customer from ${wo.customer.companyName} to ${data.customer.companyName}` +
            '<br/><br/>';
        if (data.type)
          updatedHTML +=
            `${data.eventUser.name} changed the Type of Service from ${WO_TYPE_LIST[wo.type]
            } to ${WO_TYPE_LIST[data.type]}` + '<br/><br/>';
        if (data.NTE)
          updatedHTML +=
            `${data.eventUser.name} changed the NTE from ${wo.NTE} to ${data.NTE}` +
            '<br/><br/>';
        if (data.startDate)
          updatedHTML +=
            `${data.eventUser.name} changed the Start Date from ${formatDate(
              wo.startDate,
              'MM/DD/YYYY',
            )} to ${formatDate(data.startDate, 'MM/DD/YYYY')}` + '<br/><br/>';
        if (data.asset)
          updatedHTML +=
            `${data.eventUser.name} changed the Asset from  ${wo.asset} to ${data.asset}` +
            '<br/><br/>';
        if (data.customerPONumber)
          updatedHTML +=
            `${data.eventUser.name} changed the Customer PO # from ${wo.customerPONumber} to ${data.customerPONumber}` +
            '<br/><br/>';
        if (data.description)
          updatedHTML +=
            `${data.eventUser.name} changed the Description <br/>
          From: ${wo.description} <br/> 
          To: ${data.description}` + '<br/><br/>';
        if (data.billedData) {
          updatedHTML +=
            `${data.eventUser.name} added billed date.  <br/>Date: ${wo.billedData.at(-1).date
            }  <br/>Note: ${data.billedData.at(-1).note}` + '<br/><br/>';
        }

        const mailOptions = {
          from: config.mail.supportEmail,
          to: recipientEmailArray, // list of receivers (separated by ,)
          subject: 'Updated WO# ' + wo.number + ', ' + wo.customer.companyName,
          text: 'Updated WO# ' + wo.number + ', ' + wo.customer.companyName,
          html:
            `WO#: ${wo.number}` +
            '<br/>' +
            `Type of WO#: ${WO_TYPE_LIST[wo.type]}` +
            '<br/>' +
            `Customer Name: ${wo.customer.companyName}` +
            '<br/>' +
            `Description: ${wo.description}` +
            '<br/>' +
            `Technician Assigned: ${getAssignedTechsNameArray(
              wo.assignedTechs,
            )}` +
            '<br/><br/>' +
            updatedHTML,
        };
        this.emailService.sendEmail(mailOptions);
      }
    } catch (e) {
      console.log(e);
    }
    // }
    Object.assign(wo, data);
    try {
      await this.repo.save(wo);
    } catch (e) {
      console.log('aaaaaa', e);
    }

    let updatedWo = await this.findBasicWorkOrdersById(id);
    updatedWo['pos'] = await this.findAllPosByWoId(id);
    updatedWo['history'] = await this.historyService.getAllByWoId(id);
    return updatedWo;
  }

  async uploadFile(
    fileNames: string[],
    id: number,
    type: number,
  ): Promise<string[]> {
    const wo = await this.repo.findOne({
      where: { id: id },
      // relations: [
      //   'requestedUser',
      //   'openUser',
      //   'customer',
      //   'serviceTicketProvider',
      //   'assignedTechs',
      //   'assignedTechs.user',
      //   'pos',
      //   'pos.issuedUser',
      //   'pos.poItems',
      //   'requestedCustomerUser',
      //   'history',
      //   'history.user',
      //   'customerNotes',
      //   'customerNotes.sender',
      //   'customerNotes.customerSender',
      // ],
    });

    if (type === 1) {
      if (wo.attachments) {
        for (let fileName of fileNames) {
          wo.attachments.push(fileName);
        }
      } else {
        wo.attachments = fileNames;
      }
    } else if (type === 2) {
      if (wo.proposals) {
        for (let fileName of fileNames) {
          wo.proposals.push(fileName);
        }
      } else {
        wo.proposals = fileNames;
      }
    }

    await this.repo.save(wo);
    return type === 1 ? wo.attachments : wo.proposals;
  }

  //attach materials

  async attachMaterials(id, data, eventUser, company): Promise<WoEntity> {
    let materialArray = [];
    if (data.materials) {
      let materialData = JSON.parse(data.materials);

      for (let material of materialData) {
        let newFileName = null;
        if (material.attachment && material.base64) {
          const fileName = material.attachment.split('.')[0];
          const extension = material.attachment.split('.')[1];
          newFileName = fileName + '-' + String(Date.now()) + '.' + extension;
          const filePath = `public/${company}/uploads/${newFileName}`;

          const buffer = Buffer.from(material.base64, 'base64');
          try {
            await fs.promises.writeFile(filePath, buffer);
          } catch (err) {
            console.log('err: ', err);
          }
        }

        materialArray.push({
          description: material.description,
          quantity: material.quantity,
          attachment: newFileName,
        });
      }
    }

    const wo = await this.repo.findOne({
      where: { id: id },
      relations: ['branch'],
    });

    if (materialArray.length > 0) {
      if (wo.materials) {
        wo.materials = JSON.stringify([
          ...JSON.parse(wo.materials),
          ...materialArray,
        ]);
      } else {
        wo.materials = JSON.stringify(materialArray);
      }
    }

    if (data.ticketReceipients && data.ticketReceipients.length > 0) {
      wo.ticketReceipients = data.ticketReceipients;
    }
    // if (data.isRefrigerantAdded !== null) {
    //   wo.isRefrigerantAdded = data.isRefrigerantAdded;
    //   if (data.isRefrigerantAdded === false) {
    //     wo.refrigerantType = null;
    //     wo.refrigerantQuantity = null;
    //   }
    // }
    // if (data.refrigerantType && data.isRefrigerantAdded === true) {
    //   wo.refrigerantType = data.refrigerantType;
    // }
    // if (data.refrigerantQuantity && data.isRefrigerantAdded === true) {
    //   wo.refrigerantQuantity = data.refrigerantQuantity;
    // }

    if (data.recommendations && data.recommendations.length > 0) {
      //save history when the service ticket is modifed by non-technician
      if (
        wo.recommendations !== data.recommendations &&
        eventUser.roles[0].name !== 'Technician'
      ) {
        await this.historyService.create({
          user: eventUser,
          wo: wo,
          description: 'Modified Service Ticket: Modified Recommendations',
        });
      }
      wo.recommendations = data.recommendations;
    }
    if (data.servicesProvided && data.servicesProvided.length > 0) {
      //save history when the service ticket is modifed by non-technician
      if (
        wo.servicesProvided !== data.servicesProvided &&
        eventUser.roles[0].name !== 'Technician'
      ) {
        await this.historyService.create({
          user: eventUser,
          wo: wo,
          description: 'Modified Service Ticket: Modified Services Provided',
        });
      }
      wo.servicesProvided = data.servicesProvided;
    }
    if (data.isServiceTicketEdited) {
      wo.isServiceTicketEdited = true;
    }

    //check if timesheet is changed. if changed, save the history.
    let isTimesheetChanged = false;
    if (data.timesheetData) {
      for (let tech of JSON.parse(data.timesheetData)) {
        let technicianEntity = await this.technicianRepo.findOne({
          where: { id: tech.id },
        });
        if (technicianEntity.totalTimesheet !== tech.totalTimesheet) {
          isTimesheetChanged = true;
        }
        technicianEntity.totalTimesheet = tech.totalTimesheet;
        await this.technicianRepo.save(technicianEntity);
      }
    }
    if (isTimesheetChanged) {
      await this.historyService.create({
        user: eventUser,
        wo: wo,
        description: 'Modified Service Ticket: Modified Timesheet',
      });
    }

    await this.repo.save(wo);

    //send email notification when technician save the draft of service ticket
    await this.previewServiceTicket(id, company);
    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        0,
        0,
        5,
        wo.branch.id,
        company,
      );
      let recipientEmailArray = await this.userService.getRecipientEmailArray(
        item,
      );

      const fileName = 'service_ticket_' + String(wo.number) + '.pdf';
      const filePath = `public/${company}/serviceticket/${fileName}`;
      const attachment = fs.readFileSync(filePath).toString('base64');

      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: `Incomplete Service Ticket #${wo.number}`,
        text: `A Draft Service Ticket has been submitted for WO#${wo.number}`,
        html: ' ',
        attachments: [
          {
            content: attachment,
            filename: fileName,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      this.emailService.sendEmail(mailOptions);
    } catch (e) {
      console.log(e);
    }

    let woEntity = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.poItems',
        'requestedCustomerUser',
      ],
    });

    woEntity['startDateString'] = woEntity.startDate
      ? formatDate(woEntity.startDate, 'MM/DD/YYYY')
      : '';
    return woEntity;
  }

  deleteOtherMaterial = async (woID, index, company) => {
    const wo = await this.repo.findOne({
      where: { id: woID },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
      ],
    });

    let materials = JSON.parse(wo.materials);

    if (materials[index].attachment) {
      const filePath = getUploadPath(company, materials[index].attachment);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting wo material attachment:', err);
      }
    }

    materials.splice(index, 1);
    wo.materials = JSON.stringify(materials);

    return await this.repo.save(wo);
  };

  updateOtherMaterial = async (woID, index, data, eventUser, company) => {
    const wo = await this.repo.findOne({
      where: { id: woID },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
      ],
    });

    let materials = JSON.parse(wo.materials);
    materials[index].description = data.description;
    materials[index].quantity = data.quantity;
    wo.materials = JSON.stringify(materials);

    await this.historyService.create({
      user: eventUser,
      wo: wo,
      description: 'Modified Service Ticket: Modified Misc Materials',
    });

    return await this.repo.save(wo);
  };

  previewServiceTicket = async (id, company: string) => {
    const wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
        'branch',
      ],
    });

    let timesheetData = [];
    for (let tech of wo.assignedTechs) {
      const technician = tech as TechnicianEntity;

      if (technician.timesheet) {
        let timesheet = JSON.parse(technician.timesheet);

        for (let item of timesheet) {
          if (
            (item.regularTime && item.regularTime !== '00:00') ||
            (item.overTime && item.overTime !== '00:00')
          ) {
            timesheetData.push({
              name: technician.user.name,
              avatar: getAvatarUrl(company, technician.user.avatar),
              date: moment(wo.startDate)
                .add(item.dayDiff, 'days')
                .format('MM/DD/YYYY'),
              regularTime:
                item.regularTime && item.regularTime !== '00:00'
                  ? item.regularTime
                  : '__:__',
              overTime:
                item.overTime && item.overTime !== '00:00'
                  ? item.overTime
                  : '__:__',
            });
          }
        }
      }
    }

    let attachments = [];
    if (wo.attachments) {
      for (let attachment of wo.attachments) {
        if (isImageFile(attachment)) {
          attachments.push({
            fileName: getRealFileName(attachment),
            url: getThumbnailUrl(company, attachment),
          });
        }
      }
    }

    if (wo.attachments) {
      for (let attachment of wo.attachments) {
        if (
          isImageFile(attachment) &&
          !fs.existsSync(getThumbnailPath(company, attachment))
        ) {
          try {
            await compressImage(
              getUploadPath(company, attachment),
              `./public/${company}/thumbnails`,
            );
          } catch (error) {
            console.log('🚀 ~ previewServiceTicket= ~ error:', error);
          }
        }
      }
    }

    let pos = [];
    if (wo.pos) {
      pos = _.cloneDeep(wo.pos);
      for (let i = 0; i < pos.length; i++) {
        if (pos[i].attachments) {
          for (
            let poIndex = 0;
            poIndex < pos[i].attachments.length;
            poIndex++
          ) {
            pos[i].attachments[poIndex] = {
              fileName: getRealFileName(pos[i].attachments[poIndex]),
              url: getUploadUrl(company, pos[i].attachments[poIndex]),
            };
          }
        }
        if (pos[i].poItems) {
          for (let poIndex = 0; poIndex < pos[i].poItems.length; poIndex++) {
            if (pos[i].poItems[poIndex].attachment) {
              pos[i].poItems[poIndex].attachment = {
                fileName: getRealFileName(pos[i].poItems[poIndex].attachment),
                url: getUploadUrl(company, pos[i].poItems[poIndex].attachment),
              };
            }
          }
        }
        pos[i].createdAt = formatDate(pos[i].createdAt);
        pos[i].issuedDate = formatDate(pos[i].issuedDate);
        pos[i].paymentType = paymentItems[pos[i].paymentType];
        if (pos[i].issuedUser) {
          pos[i].issuedUser = {
            name: pos[i].issuedUser.name,
            avatar: getAvatarUrl(company, pos[i].issuedUser.avatar),
          };
        }
      }
    }

    let materials = [];
    if (wo.materials) {
      materials = JSON.parse(wo.materials);
      for (let i = 0; i < materials.length; i++) {
        if (materials[i].attachment) {
          materials[i].link = getUploadUrl(company, materials[i].attachment);
          materials[i].attachment = getRealFileName(materials[i].attachment);
        } else {
          materials[i].attachment = '';
        }
      }
    }

    let woMaterials = await this.materialService.listWoMaterials(wo.id);
    console.log('🚀 ~ WoService ~ woMaterials:', woMaterials);
    let woMaterialsData = [];
    woMaterials.forEach((material) => {
      woMaterialsData.push({
        name: `${material.materialCategory.name} Used?`,
        content: `${material.isAdded ? 'Yes' : 'No'}${material.isAdded && material.materialType
          ? ' - Type: ' +
          material.materialType.name +
          ' - Quantity: ' +
          material.quantity +
          '(' +
          material.materialCategory.unit +
          ')'
          : ''
          }`,
      });
    });
    console.log('111111111111:', woMaterialsData);

    console.log('🚀 ~ WoService ~ company:', company);
    const companyData: CompanyEntity = await this.companyService.get(company);

    const data = {
      companyLogo:
        company === 'rscs' && wo.branch?.name === 'MRC'
          ? `${API_URL}/rscs/company/MRCLogo.png`
          : companyData.logo
            ? `${API_URL}/${company}/company/logo.png`
            : '',
      companyAddress: wo.branch.address,
      companyPhone: wo.branch.phone,
      companyWebsite:
        company === 'rscs' && wo.branch?.name === 'MRC'
          ? 'www.mechanicrefrigeration.com'
          : companyData.website,
      woStartDate: wo.startDate ? formatDate(wo.startDate, 'MM/DD/YYYY') : '',
      woOpenDate: wo.openDate ? formatDate(wo.openDate) : '',
      woClosedDate: wo.closedDate ? formatDate(wo.closedDate) : '',
      // woRequestedUserName: wo.requestedUser?.name,
      // woRequestedUserAvatar: wo.requestedUser
      //   ? getAvatarUrl(headers.busines, wo.requestedUser.avatar)
      //   : null,
      woIssuedUserName: wo.openUser?.name,
      woIssuedUserAvatar: getAvatarUrl(company, wo.openUser?.avatar),
      woAsset: wo.asset ? wo.asset : '',
      woSignatureURL: getSignatureUrl(
        company,
        'signature' + '_' + String(wo.number) + '.png',
      ),
      woSignerName: wo.signerName ? wo.signerName : '',
      woStSignedDate: wo.stSignedDate ? formatDate(wo.stSignedDate) : '',
      NTE: wo.NTE,
      customerPONumber: wo.customerPONumber,
      customerAddress: wo.customer.address,
      customerName: wo.customer.companyName,
      customerEmail: '', // customerEmail: wo.customer.email,
      customerContact: '', // customerContact: wo.customer.contact,
      customerPhone: wo.customer.phone,
      woNumber: wo.number,
      woRequestedUser: wo.requestedUser?.name,
      woDescription: wo.description,
      woServicesProvided: wo.servicesProvided,
      woRecommendations: wo.recommendations,
      woAttachment: attachments,
      timesheetData: timesheetData,
      pos: pos,
      materialArray: materials,
      woMaterialsData: woMaterialsData,
    };

    let path =
      'src/core/templates/serviceticket/service_ticket_template_origin.html';
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'staging'
    ) {
      path = 'core/templates/serviceticket/service_ticket_template_origin.html';
    }
    const template = fs.readFileSync(path, 'utf-8');

    const renderedHtml = ejs.render(template, data);

    let options = {
      format: 'A4',
      width: '8.5in',
      height: '11in',
      title: 'Service Ticket',
      margin: { top: 40, left: 20, right: 20, bottom: 20 },
    };

    let file = { content: renderedHtml };

    try {
      const pdfBuffer = await htmlPDF.generatePdf(file, options);

      const fileName = 'service_ticket_' + String(wo.number) + '.pdf';
      const pdfFile = `public/${company}/serviceticket/${fileName}`;

      fs.writeFileSync(pdfFile, pdfBuffer);
      let result = await this.repo.save(wo);
      return result;
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  //submit the service ticket
  saveSignature = async (
    id,
    signerName,
    signatureString,
    stSignedDate,
    serviceTicketProvider,
    company,
  ) => {
    const wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'branch',
      ],
    });

    const newFileName = 'signature' + '_' + String(wo.number) + '.png';
    const signaturePath = `public/${company}/signatures/${newFileName}`;

    const buffer = Buffer.from(
      signatureString.replace(/^data:image\/png;base64,/, ''),
      'base64',
    );

    try {
      await fs.promises.writeFile(signaturePath, buffer);

      await this.repo.update(id, {
        signerName,
        status: 5,
        stSignedDate,
        completedDate: moment().toDate(),
        serviceTicketProvider,
      });

      await this.previewServiceTicket(id, company);

      // wo.signerName = signerName;
      // wo.status = 5;
      // wo.stSignedDate = stSignedDate;
      // wo.serviceTicketProvider = serviceTicketProvider;

      //send push notification
      let pushItem: NotificationEntity =
        await this.notificationService.getOneItem(
          1,
          0,
          1,
          wo.branch.id,
          company,
        );
      if (pushItem) {
        let recipientEmailArray = await this.userService.getRecipientEmailList(
          pushItem,
        );
        this.pusherService.sendPushNotification(
          recipientEmailArray,
          'Service ticket is completed',
          'Work order number is ' + wo.number,
        );
      }

      //send email notification
      let emailItem: NotificationEntity =
        await this.notificationService.getOneItem(
          0,
          0,
          3,
          wo.branch.id,
          company,
        );
      let recipientEmailArray = [];

      if (emailItem) {
        recipientEmailArray.push(
          ...(await this.userService.getRecipientEmailList(emailItem)),
        );
      }
      if (wo.ticketReceipients) {
        recipientEmailArray.push(...wo.ticketReceipients.split(/,\s*/));
      }

      const fileName = 'service_ticket_' + String(wo.number) + '.pdf';
      const filePath = `public/${company}/serviceticket/${fileName}`;
      const attachment = fs.readFileSync(filePath).toString('base64');

      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: 'Service ticket is completed. WO# ' + wo.number,
        text: 'Service ticket is completed. WO# ' + wo.number,
        html:
          `WO Number: ${wo.number}` +
          '<br/>' +
          `WO Description: ${wo.description}` +
          '<br/>' +
          `Customer: ${wo.customer.companyName}` +
          '<br/>' +
          `Technician: ${getAssignedTechsNameArray(wo.assignedTechs)}`,
        attachments: [
          {
            content: attachment,
            filename: fileName,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };

      return await this.emailService.sendEmail(mailOptions);
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  sendServiceTicketEmail = async (
    // receipientList: string,
    // pdfFile: string,
    // fileName: string,
    id: number,
    stSentDate: Date,
    company,
  ) => {
    const wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
        'branch',
      ],
    });

    if (wo.status < 6) {
      wo.status = 6;
    }
    wo.stSentDate = stSentDate;
    wo.isServiceTicketEdited = false;

    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        0,
        0,
        1,
        wo.branch.id,
        company,
      );
      let recipientEmailArray = await this.userService.getRecipientEmailArray(
        item,
      );

      const fileName = 'service_ticket_' + String(wo.number) + '.pdf';
      const filePath = `public/${company}/serviceticket/${fileName}`;
      const attachment = fs.readFileSync(filePath).toString('base64');

      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: 'Work Order(' + wo.number + ') service ticket is reviewed',
        text: ' ',
        html: ' ',
        attachments: [
          {
            content: attachment,
            filename: fileName,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      this.emailService.sendEmail(mailOptions);
    } catch (e) {
      console.log(e);
    }

    return await this.repo.save(wo);
  };

  //This functions take too long to run. DO NOT USE
  async findWorkOrderById(id) {
    const order = await this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
      .leftJoinAndSelect('wo.openUser', 'openUser')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('wo.pos', 'pos')
      .leftJoinAndSelect('wo.history', 'history')
      .leftJoinAndSelect('history.user', 'historyUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .leftJoinAndSelect('pos.issuedUser', 'poIssuedUser')
      .leftJoinAndSelect('pos.issuedBy', 'poIssuedBy')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .leftJoinAndSelect('wo.branch', 'branch')
      .where('wo.id = :id', { id: id })
      .orderBy('history.createdAt', 'DESC')
      .addOrderBy('assignedTechs.createdAt', 'ASC')
      .addOrderBy('pos.createdAt', 'DESC')
      .getOne();

    order['startDateString'] = order.startDate
      ? formatDate(order.startDate, 'MM/DD/YYYY')
      : '';

    return order;
  }

  async findOrderById(id) {
    let orders = await this.findBasicWorkOrdersById(id);
    orders['pos'] = await this.findAllPosByWoId(id);
    orders['history'] = await this.historyService.getAllByWoId(id);
    orders['customerNotes'] = await this.customerNoteService.getAllByWoId(id);
    return orders;
  }

  async findBasicWorkOrdersById(id) {
    const order = await this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
      .leftJoinAndSelect('wo.openUser', 'openUser')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .leftJoinAndSelect('wo.branch', 'branch')
      .leftJoinAndSelect('wo.requestedCustomerUser', 'requestedCustomerUser')
      .leftJoinAndSelect('wo.history', 'history')
      .leftJoinAndSelect('history.user', 'historyUser')
      .leftJoinAndSelect('wo.quotedBy', 'quotedBy')
      .where('wo.id = :id', { id: id })
      .addOrderBy('assignedTechs.createdAt', 'ASC')
      .getOne();

    order['startDateString'] = order.startDate
      ? formatDate(order.startDate, 'MM/DD/YYYY')
      : '';

    order['customerNotes'] = await this.customerNoteService.getAllByWoId(id);

    return order;
  }

  async findWorkOrderByNumber(number) {
    let entity = await this.repo.findOne({
      where: { number: number },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
        'requestedCustomerUser',
      ],
    });

    if (entity && entity.assignedTechs) {
      entity.assignedTechs = entity.assignedTechs.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    }

    return entity;
  }

  async deleteWorkOrderByID(id, company: string) {
    const wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.issuedUser',
        'pos.poItems',
        'requestedCustomerUser',
      ],
    });

    const { affected } = await this.repo.delete(id);
    if (affected > 0) {
      //delete wo attachments
      if (wo.attachments) {
        for (let attachment of wo.attachments) {
          const filePath = getUploadPath(company, attachment);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting wo attachment:', err);
          }
        }
      }

      //delete wo signature
      const signaturePath = getSignaturePath(
        company,
        `signature_${wo.number}.png`,
      );
      try {
        fs.unlinkSync(signaturePath);
      } catch (err) {
        console.error('Error deleting wo signature:', err);
      }

      //delete wo service ticket
      const serviceticketPath = getServiceTicketPath(
        company,
        `service_ticket_${wo.number}.pdf`,
      );
      try {
        fs.unlinkSync(serviceticketPath);
      } catch (err) {
        console.error('Error deleting wo service ticket:', err);
      }

      //delete materials
      if (wo.materials) {
        for (let material of JSON.parse(wo.materials)) {
          const filePath = getUploadPath(company, material.attachment);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting wo material:', err);
          }
        }
      }

      //delete pos and poitems
      const pos = JSON.parse(JSON.stringify(wo.pos));
      for (let po of pos) {
        //delete receipts of po
        if (po.attachments) {
          for (let attachment of po.attachments) {
            const filePath = getPOReceiptPath(company, attachment);
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error('Error deleting po receipts:', err);
            }
          }
        }
        //delete attachments of poitem
        for (let poItem of po.poItems) {
          if (poItem.attachment) {
            const filePath = getUploadPath(company, poItem.attachment);
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error('Error deleting poitem attachment:', err);
            }
          }
        }
      }
      return true;
    } else {
      throw new NotFoundException(`User not found`);
    }
  }

  async getOpenWorkOrders() {
    const orders = await this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
      .leftJoinAndSelect('wo.openUser', 'openUser')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('wo.pos', 'pos')
      .leftJoinAndSelect('pos.poItems', 'items')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'user')
      .where('wo.status >= :status', { status: 1 })
      .andWhere('wo.status < :status', { status: 100 })
      .orderBy('wo.createdAt', 'DESC')
      .getMany();

    return orders;
  }

  async findAssignedOpenOrders(userId, branchId) {
    // First, get order IDs that have the matching technician
    const matchingOrderIds = await this.repo
      .createQueryBuilder('order')
      .select('order.id', 'id')
      .leftJoin('order.assignedTechs', 'assignedTechs')
      .leftJoin('assignedTechs.user', 'user')
      .where('order.status < :status', { status: 5 })
      .andWhere('order.branch.id = :branchId', { branchId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (matchingOrderIds.length === 0) {
      return [];
    }

    // Then, load all orders with ALL assignedTechs
    return await this.repo
      .createQueryBuilder('order')
      .where('order.id IN (:...ids)', { ids: matchingOrderIds })
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .leftJoinAndSelect('order.branch', 'branch')
      .getMany();
  }

  async findAssignedCompletedOrders(userId, branchId) {
    // First, get order IDs that have the matching technician
    const matchingOrderIds = await this.repo
      .createQueryBuilder('order')
      .select('order.id', 'id')
      .leftJoin('order.assignedTechs', 'assignedTechs')
      .leftJoin('assignedTechs.user', 'user')
      .where('order.status = :status', { status: 5 })
      .andWhere('order.branch.id = :branchId', { branchId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (matchingOrderIds.length === 0) {
      return [];
    }

    // Then, load all orders with ALL assignedTechs
    return await this.repo
      .createQueryBuilder('order')
      .where('order.id IN (:...ids)', { ids: matchingOrderIds })
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .leftJoinAndSelect('order.branch', 'branch')
      .getMany();
  }

  async findAssignedReviewedOrders(userId, branchId) {
    // First, get order IDs that have the matching technician
    const matchingOrderIds = await this.repo
      .createQueryBuilder('order')
      .select('order.id', 'id')
      .leftJoin('order.assignedTechs', 'assignedTechs')
      .leftJoin('assignedTechs.user', 'user')
      .where('order.status = :status', { status: 6 })
      .andWhere('order.branch.id = :branchId', { branchId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (matchingOrderIds.length === 0) {
      return [];
    }

    // Then, load all orders with ALL assignedTechs
    return await this.repo
      .createQueryBuilder('order')
      .where('order.id IN (:...ids)', { ids: matchingOrderIds })
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .leftJoinAndSelect('order.branch', 'branch')
      .getMany();
  }

  async findAssignedBilledOrders(userId, branchId) {
    // First, get order IDs that have the matching technician
    const matchingOrderIds = await this.repo
      .createQueryBuilder('order')
      .select('order.id', 'id')
      .leftJoin('order.assignedTechs', 'assignedTechs')
      .leftJoin('assignedTechs.user', 'user')
      .where('order.status = :status', { status: 100 })
      .andWhere('order.branch.id = :branchId', { branchId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('assignedTechs.status = :assignedTechsStatus', {
        assignedTechsStatus: 1,
      })
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    if (matchingOrderIds.length === 0) {
      return [];
    }

    // Then, load all orders with ALL assignedTechs
    return await this.repo
      .createQueryBuilder('order')
      .where('order.id IN (:...ids)', { ids: matchingOrderIds })
      .leftJoinAndSelect('order.requestedUser', 'requestedUser')
      .leftJoinAndSelect('order.openUser', 'openUser')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('order.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedUser')
      .leftJoinAndSelect('order.pos', 'pos')
      .leftJoinAndSelect('pos.issuedUser', 'issuedUser')
      .leftJoinAndSelect('pos.poItems', 'poItems')
      .leftJoinAndSelect('order.branch', 'branch')
      .getMany();
  }

  async findAllRecommendations(
    keyword,
    branchId,
    pageNumber,
    status,
    company: string,
  ) {
    let baseQuery = this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
      // .leftJoinAndSelect('wo.openUser', 'openUser')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      // .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
      // .leftJoinAndSelect('wo.pos', 'pos')
      // .leftJoinAndSelect('pos.poItems', 'items')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .where('wo.status >= :status', { status: 5 })
      .andWhere('LENGTH(TRIM(wo.recommendations)) > 0')
      .andWhere('wo.company = :company', { company: company })
      .andWhere(
        new Brackets((qb) => {
          qb.where('wo.number ILike :searchString', {
            searchString: `%${keyword}%`,
          })
            .orWhere('techUser.name ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('customer.companyName ILike :searchString', {
              searchString: `%${keyword}%`,
            })
            .orWhere('wo.recommendations ILike :searchString', {
              searchString: `%${keyword}%`,
            });
        }),
      );

    if (branchId != 0) {
      baseQuery = baseQuery.andWhere('branch.id = :branchId', { branchId });
    }

    baseQuery = baseQuery
      .orderBy('wo.createdAt', 'DESC')
      .skip(ITEMS_PER_PAGE * pageNumber)
      .take(ITEMS_PER_PAGE);

    let orders = await baseQuery.getMany();
    let totalCount = await baseQuery.getCount();

    return { orders, totalCount };
  }

  async findAllRecommendationsByCustomer(
    company: string,
    customerId,
    locationId,
    pageNumber,
  ) {
    let baseQuery = this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.customerLocation', 'customerLocation')
      .andWhere('LENGTH(TRIM(wo.recommendations)) > 0')
      .andWhere('wo.company = :company', { company: company })
      .andWhere('customer.id = :customerId', { customerId });

    if (locationId != 0) {
      baseQuery = baseQuery.andWhere('wo.customerLocation.id = :locationId', {
        locationId,
      });
    }

    if (pageNumber) {
      baseQuery = baseQuery
        .orderBy('wo.createdAt', 'DESC')
        .skip(ITEMS_PER_PAGE * pageNumber)
        .take(ITEMS_PER_PAGE);

      let orders = await baseQuery.getMany();
      let totalCount = await baseQuery.getCount();

      return { orders, totalCount };
    } else {
      let result = await baseQuery.clone().getMany();
      return result;
    }
  }

  async sendWOReport(
    branchId,
    recipients,
    past7Days,
    past30Days,
    customDays,
    customStartDate,
    customEndDate,
    date,
    type,
    company,
  ) {
    let branch = await this.branchService.getBranchById(branchId);
    let query = this.repo
      .createQueryBuilder('wo')
      .where('wo.company = :company', { company })
      .leftJoinAndSelect('wo.requestedUser', 'requestedUser')
      .leftJoinAndSelect('wo.openUser', 'openUser')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.serviceTicketProvider', 'serviceTicketProvider')
      .leftJoinAndSelect('wo.pos', 'pos')
      .leftJoinAndSelect('wo.history', 'history')
      .leftJoinAndSelect('history.user', 'historyUser')
      .leftJoinAndSelect('pos.poItems', 'items')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .leftJoinAndSelect('wo.branch', 'branch');
    if (type === 'OPEN_WO') {
      query = query.where('wo.status < :status', { status: 5 });
    }
    // else if (type === 'COMPLETED_WO') {
    //   query = query
    //     .where('wo.status >= :status', { status: 5 })
    //     .andWhere('wo.status <= :status', { status: 100 });
    // }
    query = query.andWhere('wo.branch >= :branchId', { branchId });

    let endDate = moment(date).endOf('day').toDate();
    let openWOsForPast7Days = [],
      openWOsForPast30Days = [],
      startDateForPast7Days,
      startDateForPast30Days,
      customWOs = [];
    if (past7Days) {
      startDateForPast7Days = moment(date)
        .subtract(7, 'days')
        .startOf('day')
        .toDate();
      if (type === 'OPEN_WO') {
        query.andWhere('wo.createdAt >= :startDate', {
          startDate: startDateForPast7Days,
        });
        query.andWhere('wo.createdAt <= :endDate', { endDate });
      } else if (type === 'COMPLETED_WO') {
        query.andWhere('wo.completedDate >= :startDate', {
          startDate: startDateForPast7Days,
        });
        query.andWhere('wo.completedDate <= :endDate', { endDate });
      }
      openWOsForPast7Days = await query.getMany();
    }

    if (past30Days) {
      startDateForPast30Days = moment(date)
        .subtract(30, 'days')
        .startOf('day')
        .toDate();
      if (type === 'OPEN_WO') {
        query.andWhere('wo.createdAt >= :startDate', {
          startDate: startDateForPast30Days,
        });
        query.andWhere('wo.createdAt <= :endDate', { endDate });
      } else if (type === 'COMPLETED_WO') {
        query.andWhere('wo.completedDate >= :startDate', {
          startDate: startDateForPast30Days,
        });
        query.andWhere('wo.completedDate <= :endDate', { endDate });
      }
      openWOsForPast30Days = await query.getMany();
    }

    if (customDays) {
      if (type === 'OPEN_WO') {
        query.andWhere('DATE(wo.createdAt) >= :startDate', {
          startDate: moment(customStartDate, 'MM/DD/YYYY').toDate(),
        });
        query.andWhere('wo.createdAt <= :endDate', {
          endDate: moment(customEndDate, 'MM/DD/YYYY').toDate(),
        });
      } else if (type === 'COMPLETED_WO') {
        query.andWhere('DATE(wo.completedDate) >= :startDate', {
          startDate: moment(customStartDate, 'MM/DD/YYYY').toDate(),
        });
        query.andWhere('wo.completedDate <= :endDate', {
          endDate: moment(customEndDate, 'MM/DD/YYYY').toDate(),
        });
      }
      customWOs = await query.getMany();
    }

    const schema = [
      {
        column: 'WO#',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.number,
      },
      {
        column: 'Type',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.type,
      },
      {
        column: 'Customer',
        type: String,
        width: 20,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.customer,
      },
      {
        column: 'NTE',
        type: Number,
        width: 10,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.NTE,
      },
      {
        column: 'Description',
        type: String,
        width: 50,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.description,
      },
      {
        column: 'Primary Technician',
        type: String,
        width: 20,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.primaryTech,
      },
      {
        column: 'Secondary Technicians',
        type: String,
        width: 30,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.secondaryTechs,
      },
      {
        column: 'Date Started',
        type: String,
        width: 10,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.startDate,
      },
      {
        column: 'Date Completed',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.completedDate,
      },
      {
        column: 'Status',
        type: String,
        width: 10,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.status,
      },
    ];

    let recipientEmailArray =
      await this.userService.getRecipientEmailListForReport(
        recipients.join(),
        company,
      );

    if (past7Days) {
      let data = [];
      for (let order of openWOsForPast7Days) {
        const { primaryTech, secondaryTechs } = getPrimaryAndSecondaryTechs(
          order.assignedTechs,
        );
        const row = {
          number: order.number,
          type: order.type == 0 ? 'Service Call' : 'Quoted',
          customer: order.customer?.company,
          NTE: order.NTE,
          description: order.description,
          primaryTech: primaryTech,
          secondaryTechs: secondaryTechs,
          startDate: order.startDate
            ? moment(order.startDate).format('MM/DD/YYYY')
            : '',
          completedDate: order.completedDate
            ? moment(order.completedDate).format('MM/DD/YYYY')
            : '',
          status: getWorkOrderStatus(order.status),
        };
        data.push(row);
      }
      let fileNameForPast7Days = `${type === 'OPEN_WO' ? 'Open_WOs' : 'Completed_WOs'
        } Past 7 Days.xlsx`;
      let filePathForPast7Days = `./public/rscs/reports/${fileNameForPast7Days}`;
      if (!fs.existsSync(`./public/rscs/reports/`)) {
        fs.mkdirSync(`./public/rscs/reports/`, { recursive: true });
      }
      await writeXlsxFile(data, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePathForPast7Days,
      });

      const attachment = fs
        .readFileSync(filePathForPast7Days)
        .toString('base64');
      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        text: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        html: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } Work Order Report for ${branch.name} <br/> 
        Report Begin Date: ${formatDate(
            startDateForPast7Days,
            'MM/DD/YYYY',
          )} <br/>
        Report End Date: ${formatDate(endDate, 'MM/DD/YYYY')} <br/>`,
        attachments: [
          {
            content: attachment,
            filename: fileNameForPast7Days,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      this.emailService.sendEmail(mailOptions);
    }

    if (past30Days) {
      let data = [];
      for (let order of openWOsForPast30Days) {
        const { primaryTech, secondaryTechs } = getPrimaryAndSecondaryTechs(
          order.assignedTechs,
        );
        const row = {
          number: order.number,
          type: order.type == 0 ? 'Service Call' : 'Quoted',
          customer: order.customer?.company,
          NTE: order.NTE,
          description: order.description,
          primaryTech: primaryTech,
          secondaryTechs: secondaryTechs,
          startDate: order.startDate
            ? moment(order.startDate).format('MM/DD/YYYY')
            : '',
          completedDate: order.completedDate
            ? moment(order.completedDate).format('MM/DD/YYYY')
            : '',
          status: getWorkOrderStatus(order.status),
        };
        data.push(row);
      }
      let fileNameForPast30Days = `${type === 'OPEN_WO' ? 'Open_WOs' : 'Completed_WOs'
        } Past 30 Days.xlsx`;
      let filePathForPast30Days = `./public/rscs/reports/${fileNameForPast30Days}`;
      if (!fs.existsSync(`./public/rscs/reports/`)) {
        fs.mkdirSync(`./public/rscs/reports/`, { recursive: true });
      }
      await writeXlsxFile(data, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePathForPast30Days,
      });

      const attachment = fs
        .readFileSync(filePathForPast30Days)
        .toString('base64');
      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        text: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        html: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } Work Order Report for ${branch.name} <br/> 
        Report Begin Date: ${formatDate(
            startDateForPast30Days,
            'MM/DD/YYYY',
          )} <br/>
        Report End Date: ${formatDate(endDate, 'MM/DD/YYYY')} <br/>`,
        attachments: [
          {
            content: attachment,
            filename: fileNameForPast30Days,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      this.emailService.sendEmail(mailOptions);
    }

    if (customDays) {
      let data = [];
      for (let order of customWOs) {
        const { primaryTech, secondaryTechs } = getPrimaryAndSecondaryTechs(
          order.assignedTechs,
        );
        const row = {
          number: order.number,
          type: order.type == 0 ? 'Service Call' : 'Quoted',
          customer: order.customer?.company,
          NTE: order.NTE,
          description: order.description,
          primaryTech: primaryTech,
          secondaryTechs: secondaryTechs,
          startDate: order.startDate
            ? moment(order.startDate).format('MM/DD/YYYY')
            : '',
          completedDate: order.completedDate
            ? moment(order.completedDate).format('MM/DD/YYYY')
            : '',
          status: getWorkOrderStatus(order.status),
        };
        data.push(row);
      }
      let fileNameForCustomDays = `${type === 'OPEN_WO' ? 'Open_WOs' : 'Completed_WOs'
        } FROM ${formatDate(customStartDate, 'MM_DD_YYYY')} TO ${formatDate(
          customEndDate,
          'MM_DD_YYYY',
        )}.xlsx`;

      let filePathForCustomDays = `./public/rscs/reports/${fileNameForCustomDays}`;
      if (!fs.existsSync(`./public/rscs/reports/`)) {
        fs.mkdirSync(`./public/rscs/reports/`, { recursive: true });
      }
      await writeXlsxFile(data, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePathForCustomDays,
      });

      const attachment = fs
        .readFileSync(filePathForCustomDays)
        .toString('base64');
      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        text: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } WO Report ${formatDate(date, 'MM/DD/YYYY')}`,
        html: `${branch.name} ${type === 'OPEN_WO' ? 'Open' : 'Completed'
          } Work Order Report for ${branch.name} <br/> 
        Report Begin Date: ${formatDate(customStartDate, 'MM/DD/YYYY')} <br/>
        Report End Date: ${formatDate(customEndDate, 'MM/DD/YYYY')} <br/>`,
        attachments: [
          {
            content: attachment,
            filename: fileNameForCustomDays,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      this.emailService.sendEmail(mailOptions);
    }
  }

  async saveHistory(wo, data) {
    if (
      data.description &&
      wo.description?.trim() !== data.description.trim()
    ) {
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: 'changed WO description',
      });
    }
    if (data.asset && wo.asset?.trim() !== data.asset.trim()) {
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: 'changed WO asset',
      });
    }
    if (
      data.customerPONumber &&
      wo.customerPONumber?.trim() !== data.customerPONumber.trim()
    ) {
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: 'changed customer PO #',
      });
    }
    if (data.billedData) {
      let billedData = data.billedData.at(-1);
      const description = `added billed date. Date: ${billedData.date}  Note: ${billedData.note}`;
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: description,
      });
    }
    if (data.startDate) {
      const description = 'changed start date';
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: description,
      });
    }
    if (data.status) {
      const description = `changed status from ${getWorkOrderStatus(
        wo.status,
      )} to ${getWorkOrderStatus(data.status)}`;
      await this.historyService.create({
        user: data.eventUser,
        wo: wo.id,
        description: description,
      });
    }
  }

  async getAllOrderNumber(branchId) {
    const orders = await this.repo
      .createQueryBuilder('wo')
      .where('wo.branch = :branchId', { branchId })
      .getMany();
    const orderNumbers = orders.map((order) => order.number);
    return { orderNumbers };
  }

  async getAllOrderNumberWithKeyword(keyword, branchId) {
    let query = this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.branch', 'branch')
      .where('wo.number ILike :searchString', { searchString: `%${keyword}%` });

    if (branchId != 0) {
      query = query.andWhere('branch.id = :branchId', {
        branchId,
      });
    }
    let orders = await query.getMany();
    const orderNumbers = orders.map((order) => order.number);
    return [...orderNumbers];
  }

  async deleteAttachment(woId, index, company, type) {
    console.log('🚀 ~ deleteAttachment ~ type:', type, typeof type);
    let wo = await this.repo.findOneBy({ id: woId });

    if (type === 1) {
      let attachment = wo.attachments[index];
      let newAttachments = [...wo.attachments];
      newAttachments.splice(index, 1);
      if (attachment) {
        try {
          await fs.promises.unlink(`./public/${company}/uploads/${attachment}`);
          let result = await this.repo.update(woId, {
            attachments: newAttachments,
          });
          return true;
        } catch (error) {
          return error;
        }
      }
    } else if (type === 2) {
      let proposal = wo.proposals[index];
      let newProposals = [...wo.proposals];
      newProposals.splice(index, 1);
      if (proposal) {
        try {
          await fs.promises.unlink(`./public/${company}/uploads/${proposal}`);
          let result = await this.repo.update(woId, {
            proposals: newProposals,
          });
          return true;
        } catch (error) {
          return error;
        }
      }
    }
  }

  async findAllPosByWoId(woId) {
    const result = await this.poRepo.find({
      where: {
        wo: {
          id: woId,
        },
      },
      relations: ['poItems', 'issuedUser', 'issuedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
    return result;
  }

  async checkWoNumberDuplicate(number, company) {
    const existingWO = await this.repo.findOne({
      where: { number: number, company: company },
    });
    return existingWO ? true : false;
  }
}
