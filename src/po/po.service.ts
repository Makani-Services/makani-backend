import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import * as ejs from 'ejs';
import * as htmlPDF from 'html-pdf-node';

import { CreatePoDto } from './dto/create-po.dto';
import { UpdatePoDto } from './dto/update-po.dto';
import { PoEntity } from './entities/po.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { PoItemService } from 'src/poitem/poitem.service';

import * as inlineCss from 'inline-css';
// import * as fs from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import writeXlsxFile from 'write-excel-file/node';
import { default as config } from '../config';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { PusherService } from 'src/pusher/pusher.service';
import { WoService } from 'src/wo/wo.service';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';
import {
  API_URL,
  formatDate,
  getRealFileName,
  getUploadUrl,
  paymentItems,
  ITEMS_PER_PAGE,
  getAssignedTechsNameArray,
  getPoReceiptUrl,
  getPurchaseOrderStatus,
  getPOReceiptPath,
  getUploadPath,
  isValidUUID,
} from 'src/core/common/common';
import { HistoryService } from 'src/history/history.service';
import { UpdateWoDto } from 'src/wo/dto/update-wo.dto';

const schema = [
  {
    column: 'PO#',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.number,
  },
  {
    column: 'Vendor',
    type: String,
    width: 20,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.vendor,
  },
  {
    column: 'Description',
    type: String,
    width: 50,
    wrap: true,
    align: 'left',
    alignVertical: 'center',
    value: (order) => order.description,
  },
  {
    column: 'Technician',
    type: String,
    width: 25,
    wrap: true,
    align: 'left',
    alignVertical: 'center',
    value: (order) => order.technician,
  },
  {
    column: 'Parent WO#',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.parentWO,
  },
  {
    column: 'Customer',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.customer,
  },
  {
    column: 'Issued By',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.issuedUser,
  },
  {
    column: 'Status',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.status,
  },
  {
    column: 'Payment Type',
    type: String,
    width: 15,
    wrap: true,
    align: 'center',
    alignVertical: 'center',
    value: (order) => order.paymentType,
  },
];
@Injectable()
export class PoService extends TypeOrmCrudService<PoEntity> {
  constructor(
    @InjectRepository(PoEntity) repo: Repository<PoEntity>,
    @InjectRepository(WoEntity) private woRepo: Repository<WoEntity>,
    private poItemService: PoItemService,
    @InjectRepository(PoItemEntity)
    private poitemRepo: Repository<PoItemEntity>,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly pusherService: PusherService,
    private readonly woService: WoService,
    private readonly companyService: CompanyService,
    private readonly historyService: HistoryService,
  ) {
    super(repo);
  }

  async create(data, company) {
    let newPO = new PoEntity(data.po as CreatePoDto);
    let wo = await this.woService.findBasicWorkOrdersById(newPO.wo);

    let maxPo = null;
    // START: Temporary Fix for Utah branch
    if (wo.branch.id === 7) {
      maxPo = await this.repo
        .createQueryBuilder('po')
        .leftJoin('po.wo', 'wo')
        .leftJoin('wo.branch', 'branch')
        .select('po.number')
        .where('branch.id = :branchId', { branchId: wo.branch.id })
        .andWhere('CAST(po.number AS INTEGER) < 900000')
        .orderBy('CAST(po.number AS INTEGER)', 'DESC')
        .getOne();
    } else {
      // END: Temporary Fix for Utah branch
      maxPo = await this.repo
        .createQueryBuilder('po')
        .leftJoin('po.wo', 'wo')
        .leftJoin('wo.branch', 'branch')
        .select('po.number')
        .where('branch.id = :branchId', { branchId: wo.branch.id })
        .orderBy('CAST(po.number AS INTEGER)', 'DESC')
        .getOne();
    }
    console.log('🚀 ~ PoService ~ create ~ maxPo:', maxPo, wo.branch.id);
    const newNumber = maxPo?.number
      ? String(Number(maxPo.number) + 1)
      : wo.branch.poStartNumber;
    console.log('🚀 ~ PoService ~ create ~ newNumber:', newNumber);
    newPO.number = newNumber;

    try {
      let poItemArray = await this.poItemService.createMultipleItems(
        data.items,
        company,
      );
      newPO.poItems = poItemArray;

      // send email notification
      // if (!newPO.number) {
      //   this.sendEmailsForPORequest(newPO.wo.number);
      // }

      // const wo = await this.woService.findBasicWorkOrdersById(newPO.wo);

      if (newPO.status === 0) {
        //when PO is requested
        //send push notification
        try {
          let item: NotificationEntity =
            await this.notificationService.getOneItem(
              1,
              1,
              0,
              wo.branch.id,
              company,
            );
          if (item) {
            let recipientEmailArray =
              await this.userService.getRecipientEmailList(item);
            this.pusherService.sendPushNotification(
              recipientEmailArray,
              'New purchase order requested',
              'Work order number is ' + wo.number,
            );
          }
        } catch (e) {
          console.log(e);
        }

        //send email notification

        try {
          let item: NotificationEntity =
            await this.notificationService.getOneItem(
              0,
              1,
              3,
              wo.branch.id,
              company,
            );
          let recipientEmailArray =
            await this.userService.getRecipientEmailArray(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'New PO Requested for WO# ' + wo.number,
            text: ' ',
            html:
              `Customer Name: ${wo.customer.companyName}` +
              '<br/>' +
              `WO #: ${wo.number}` +
              '<br/>' +
              `WO Description: ${wo.description}` +
              '<br/>' +
              `Vendor: ${newPO.vendor}` +
              '<br/>' +
              `PO Description: ${newPO.description}`,
          };
          this.emailService.sendEmail(mailOptions);
        } catch (e) {
          console.log(e);
        }
      } else if (newPO.status === 2) {
        //when po is issued
        newPO.wo = wo;
      }

      await this.repo.save(newPO);

      if (newPO.status === 2) {
        //Send email notification when issued
        let po = await this.repo.findOne({
          where: {
            id: newPO.id,
          },
          relations: [
            'wo',
            'wo.branch',
            'issuedUser',
            'issuedBy',
            'wo.customer',
          ],
        });
        this.sendEmailWhenPOIssued(po, company);
        //save history when issued
        this.saveHistory(po.wo.id, data.eventUser, `issued PO #${po.number}`);
      }

      //if first po is issued, change status of wo to "Parts"
      let poCount = await this.repo.count({
        where: {
          wo: {
            id: wo.id,
          },
        },
      });
      if (poCount === 1) {
        this.saveHistory(wo.id, null, `status changed to Parts`);
        // await this.woService.update(wo.id, { status: 4 });
        await this.woRepo.update(wo.id, { status: 4 });
      }
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    userId,
    branchId,
    searchString,
    pageNumber,
    status,
    criteria,
    sort,
  ) {
    let baseQuery = this.repo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.wo', 'wo')
      .leftJoinAndSelect('po.poItems', 'poItems')
      // .leftJoinAndSelect('po.requestedUser', 'requestedUser')
      .leftJoinAndSelect('po.issuedUser', 'issuedUser')
      .leftJoinAndSelect('po.issuedBy', 'issuedBy')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('wo.serviceType', 'serviceType')
      .leftJoinAndSelect('assignedTechs.user', 'techUser')
      .where('po.status >= :status', { status: status })
      .andWhere(
        new Brackets((qb) => {
          qb.where('wo.number ILike :searchString', {
            searchString: `%${searchString}%`,
          })
            .orWhere('techUser.name ILike :searchString', {
              searchString: `%${searchString}%`,
            })
            .orWhere('po.number ILike :searchString', {
              searchString: `%${searchString}%`,
            })
            .orWhere('po.description ILike :searchString', {
              searchString: `%${searchString}%`,
            })
            .orWhere('po.vendor ILike :searchString', {
              searchString: `%${searchString}%`,
            });
        }),
      )
      .orderBy('po.createdAt', 'DESC');

    //branching
    if (branchId != 0) {
      baseQuery = baseQuery.andWhere('wo.branch = :branch', {
        branch: branchId,
      });
    }

    //filtering
    if (criteria && criteria.wo && criteria.wo.length > 0) {
      baseQuery = baseQuery.andWhere('wo.number = :number', {
        number: criteria.wo,
      });
    }
    if (criteria && criteria.customer >= 0) {
      baseQuery = baseQuery.andWhere('wo.customer = :customer', {
        customer: criteria.customer,
      });
    }
    if (criteria && criteria.tech >= 0) {
      baseQuery = baseQuery.andWhere('issuedUser.id = :id', {
        id: criteria.tech,
      });
    }
    if (criteria && criteria.status >= 0) {
      baseQuery = baseQuery.andWhere('po.status= :status', {
        status: criteria.status,
      });
    }
    if (criteria && criteria.startDate) {
      baseQuery = baseQuery.andWhere('po.createdAt >= :startDate', {
        startDate: criteria.startDate,
      });
    }
    if (criteria && criteria.endDate) {
      baseQuery = baseQuery.andWhere('po.createdAt <= :endDate', {
        endDate: criteria.endDate,
      });
    }
    if (criteria && criteria.paymentType >= 0) {
      baseQuery = baseQuery.andWhere('po.paymentType = :paymentType', {
        paymentType: criteria.paymentType,
      });
    }

    if (criteria && criteria.vendor) {
      baseQuery = baseQuery.andWhere('po.vendor = :vendor', {
        vendor: criteria.vendor,
      });
    }

    //sorting
    if (sort && sort.date) {
      if (sort.date == 0) {
        baseQuery = baseQuery.orderBy('po.createdAt', 'DESC');
      } else if (sort.date == 1) {
        baseQuery = baseQuery.orderBy('po.createdAt', 'ASC');
      }
    }

    if (pageNumber) {
      const totalCount = await baseQuery.getCount();
      // let ordersForExcel = await baseQuery.getMany();
      const orders = await baseQuery
        .skip(ITEMS_PER_PAGE * pageNumber)
        .take(ITEMS_PER_PAGE)
        .getMany();
      return { orders, totalCount };
    } else {
      let result = await baseQuery.clone().getMany();
      return result;
    }
  }

  async generateExcelFile(ordersForExcel, userId) {
    //create excel file for downloading

    let data = [];
    for (let order of ordersForExcel) {
      const row = {
        number: order.number ? order.number : '',
        vendor: order.vendor,
        description: order.description,
        technician: getAssignedTechsNameArray(order.wo.assignedTechs),
        parentWO: order.wo.number,
        customer: order.wo.customer.companyName,
        issuedUser: order.issuedUser ? order.issuedUser.name : '',
        status: getPurchaseOrderStatus(order.status),
        paymentType: paymentItems[order.paymentType],
      };
      data.push(row);
    }

    const fileName = `POs_report.xlsx`;
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

  async findByWoId(woId) {
    const result = await this.repo.find({
      where: {
        wo: {
          id: woId,
        },
      },
      relations: ['wo', 'poItems', 'issuedUser', 'issuedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
    return result;
  }

  async findOneById(poId) {
    const result = await this.repo.findOne({
      where: {
        id: poId,
      },
      relations: [
        'wo',
        'poItems',
        'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        // 'wo.assignedTechs.user',
      ],
    });
    return result;
  }

  async findByPoId(poId) {
    const result = await this.repo.findOne({
      where: {
        id: poId,
      },
      relations: [
        'wo',
        'poItems',
        // 'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        'wo.assignedTechs.user',
        'wo.branch',
      ],
    });
    return result;
  }

  async update(id: number, data: UpdatePoDto, company, eventUser) {
    let po = await this.repo.findOne({
      where: { id: id },
      relations: [
        'wo',
        'wo.branch',
        'wo.pos',
        'poItems',
        // 'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        'wo.assignedTechs.user',
      ],
    });

    let oldPo = { ...po };
    Object.assign(po, data);

    if (data.status === 2) {
      //issued
      try {
        //sending email notifications
        this.sendEmailWhenPOIssued(po, company);

        //send push notification to issued technician
        try {
          this.pusherService.sendPushNotification(
            [po.issuedUser.email],
            'Purchase order is issued',
            'PO number is ' + po.number,
            { PO_ISSUED_ID: po.id },
          );
        } catch (e) {
          console.log(e);
        }

        //send push notification to receivers(clerical/managers) in Notification Center
        try {
          let item: NotificationEntity =
            await this.notificationService.getOneItem(
              2,
              1,
              0,
              po.wo.branch.id,
              company,
            );
          if (item) {
            let recipientEmailArray =
              await this.userService.getRecipientEmailList(item);
            this.pusherService.sendPushNotification(
              recipientEmailArray,
              'Purchase order is issued',
              'PO number is ' + data.number,
            );
          }
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (data.status === 4) {
      //completed
      try {
        const companyData: CompanyEntity = await this.companyService.get(
          company,
        );

        let technicians = '';
        if (po.wo.assignedTechs) {
          let primaryTech = po.wo.assignedTechs.find((obj) => obj.roleId === 0);
          if (primaryTech) {
            let currentIndex = po.wo.assignedTechs.findIndex(
              (obj) => obj.roleId === 0,
            );
            po.wo.assignedTechs.splice(currentIndex, 1);
            po.wo.assignedTechs.splice(0, 0, primaryTech);
          }
          let techNames = po.wo.assignedTechs.map((obj) => obj.user.name);
          technicians = techNames.join();
        }

        let attachmentArray = [];
        if (po.attachments) {
          for (let attachment of po.attachments) {
            attachmentArray.push({
              URL: getPoReceiptUrl(company, attachment),
              name: getRealFileName(attachment),
            });
          }
        }

        let poItems = [];
        for (let item of po.poItems) {
          poItems.push({
            ...item,
            URL: getUploadUrl(company, item.attachment),
            realFileName: getRealFileName(item.attachment),
          });
        }

        const data = {
          companyLogo: companyData
            ? `${API_URL}/${company}/company/logo.png`
            : '',
          companyAddress: po.wo.branch.address,
          companyPhone: po.wo.branch.phone,
          companyWebsite: companyData ? companyData.website : '',
          poNumber: po.number,
          date: formatDate(new Date().toISOString()),
          poType: paymentItems[po.paymentType],
          woNumber: po.wo.number,
          vendor: po.vendor,
          customerCompany: po.wo.customer.companyName,
          poDescription: po.description,
          poNote: po.note,
          technicians: technicians,
          issuedFor: po.issuedUser?.name,
          issuedBy: po.issuedBy?.name,
          attachments: attachmentArray,
          poItems: poItems,
        };

        // const template = await fs.promises.readFile(
        //   `public/${headers.business}/poreceipt/template/poreceipt_template.html`,
        //   'utf-8',
        // );

        let path = 'src/core/templates/poreceipt/poreceipt_template.html';
        if (
          process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging'
        ) {
          path = 'core/templates/poreceipt/poreceipt_template.html';
        }

        const template = await fs.promises.readFile(path, 'utf-8');

        const renderedHtml = ejs.render(template, data);

        //DO NOT delete above code

        // const css = fs.readFileSync(
        //   `public/${headers.business}/poreceipt/template/styles.css`,
        //   'utf-8',
        // );

        // let resultHTML = '';
        // try {
        //   resultHTML = await inlineCss(renderedHtml, {
        //     extraCss: css,
        //     url: ' ',
        //   });
        // } catch (error) {
        //   console.log('Inline CSS Error: ', error);
        // }

        let options = {
          format: 'A4',
          width: '8.5in',
          height: '11in',
          title: 'Service Ticket',
          margin: { top: 40, left: 20, right: 20, bottom: 20 },
        };
        let file = { content: renderedHtml };

        const pdfBuffer = await htmlPDF.generatePdf(file, options);

        const fileName = 'PO_Report_' + String(po.number) + '.pdf';
        const filePath = `./public/${company}/poreceipt/${fileName}`;

        await fs.promises.writeFile(filePath, pdfBuffer);

        //send email notification for po complete
        if (po.paymentType === 1) {
          //Reimbursed
          let item: NotificationEntity =
            await this.notificationService.getOneItem(
              0,
              1,
              4,
              po.wo.branch.id,
              company,
            );
          let recipientEmailArray =
            await this.userService.getRecipientEmailArray(item);
          if (!fs.existsSync(filePath)) {
            console.error('File does not exist:', filePath);
          }
          const attachment = fs.readFileSync(filePath).toString('base64');
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject:
              'Reimbursed Purchase Order # ' + po.number + ' is completed',
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

          await this.emailService.sendEmail(mailOptions);
        } else {
          //Acc Credit & Company CC
          let item: NotificationEntity =
            await this.notificationService.getOneItem(
              0,
              1,
              1,
              po.wo.branch.id,
              company,
            );
          let recipientEmailArray =
            await this.userService.getRecipientEmailArray(item);
          if (!fs.existsSync(filePath)) {
            console.error('File does not exist:', filePath);
          }
          const attachment = fs.readFileSync(filePath).toString('base64');
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'Purchase Order # ' + po.number + ' is completed',
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

          await this.emailService.sendEmail(mailOptions);
        }

        //save history
        this.saveHistory(po.wo.id, eventUser, `completed PO #${po.number}`);
      } catch (e) {
        console.log(e);
      }
    }

    //status is not changed. only information is updated.
    if (!data.status) {
      //Send email notification
      try {
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            0,
            1,
            2,
            oldPo.wo.branch.id,
            company,
          );
        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailArray(item);

          let updatedHTML = '<b>Updated Data:</b>' + '<br/>';
          if (oldPo.paymentType !== po.paymentType) {
            updatedHTML +=
              `Payment Type: ${paymentItems[po.paymentType]}` + '<br/>';
          }
          if (oldPo.vendor !== po.vendor) {
            updatedHTML += `Vendor: ${po.vendor}` + '<br/>';
          }
          if (oldPo.description !== po.description) {
            updatedHTML += `Description: ${po.description}` + '<br/>';
          }

          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray,
            subject: `Updated PO # ${oldPo.number} created for WO# ${oldPo.wo.number}`,
            text: `Updated PO # ${oldPo.number} created for WO# ${oldPo.wo.number}`,
            html:
              `PO#: ${oldPo.number}` +
              '<br/>' +
              `Technician: ${oldPo.issuedUser.name}` +
              '<br/>' +
              `Vendor: ${oldPo.vendor}` +
              '<br/>' +
              `Payment Type: ${paymentItems[oldPo.paymentType]}` +
              '<br/>' +
              `Description: ${oldPo.description}` +
              '<br/>' +
              `WO#: ${oldPo.wo.number}` +
              '<br/>' +
              `WO Description: ${oldPo.wo.description}` +
              '<br/><br/>' +
              updatedHTML,
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (error) {
        console.log('Sending WO issue email error: ', error);
      }
    }

    await this.repo.save(po);

    return await this.repo.findOne({
      where: { id: id },
      relations: [
        'wo',
        'wo.pos',
        'poItems',
        // 'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        'wo.assignedTechs.user',
        'wo.serviceType',
      ],
    });

    //send email notification to technician about PO request approved
    // const receipientArray = po.wo.assignedTechs.map((obj) => obj.user.email);
    // this.sendEmailsForPOApprove(receipientArray, po.number);

    // return await this.repo.findOne({
    //   where: { id: id },
    //   relations: [
    //     'wo',
    //     'wo.pos',
    //     'poItems',
    //     'requestedUser',
    //     'issuedUser',
    //     'wo.customer',
    //     'wo.assignedTechs.user',
    //   ],
    // });
  }

  async sendEmailsForPOApprove(receipientArray, poNumber) {
    try {
      const mailOptions = {
        from: config.mail.supportEmail,
        to: receipientArray, // list of receivers (separated by ,)
        subject: 'Purchase Order # ' + String(poNumber) + ' is approved',
        text: ' ',
        html: 'PO request has been approved.  PO number is ' + String(poNumber),
      };

      let result = false;
      try {
        result = await this.emailService.sendEmail(mailOptions);
      } catch (error) {
        console.log('Email Sending Error: ', error);
      }
      return result;
    } catch (e) {
      console.log('sendEmailsForPOApprove: ', e);
    }
  }

  async uploadFile(fileName: string, id: number): Promise<PoEntity> {
    const po = await this.repo.findOne({
      where: { id: id },
      relations: [
        'wo',
        'wo.pos',
        'poItems',
        // 'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        'wo.assignedTechs.user',
      ],
    });

    if (po.attachments) {
      po.attachments.push(fileName);
    } else {
      po.attachments = [fileName];
    }

    return await this.repo.save(po);
  }

  async upload(poId, name, base64, company) {
    // const fileName = name.split('.')[0];
    // const extension = name.split('.')[1];
    // const newFileName = fileName + '---' + String(Date.now()) + '.' + extension;
    // const filePath = 'public/uploads/' + newFileName;

    const po = await this.repo.findOne({
      where: { id: poId },
      relations: [
        'wo',
        'wo.branch',
        'poItems',
        // 'requestedUser',
        'issuedUser',
        'issuedBy',
        'wo.customer',
        'wo.assignedTechs.user',
      ],
    });

    let fileName = name.split('.')[0];
    if (isValidUUID(fileName)) fileName = String(Date.now());
    let fileExtension = name.split('.')[1];
    fileName = `${fileName}-${String(Date.now())}.${fileExtension}`;

    const filePath = `public/${company}/poreceipt/${fileName}`;
    try {
      const buffer = Buffer.from(base64, 'base64');
      await fs.promises.writeFile(filePath, buffer);
    } catch (err) {
      console.log('PO receipt upload error: ', err);
      throw err;
    }

    if (po.attachments) {
      po.attachments.push(fileName);
    } else {
      po.attachments = [fileName];
    }

    //send push notification
    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        1,
        1,
        1,
        po.wo.branch.id,
        company,
      );
      if (item) {
        let recipientEmailArray = await this.userService.getRecipientEmailList(
          item,
        );
        this.pusherService.sendPushNotification(
          recipientEmailArray,
          'PO receipt is uploaded',
          'Purchase order number is ' + po.number,
        );
      }
    } catch (e) {
      console.log(e);
    }

    return this.repo.save(po);
  }

  async getOpenPurchaseOrders() {
    const orders = await this.repo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.wo', 'wo')
      .leftJoinAndSelect('po.poItems', 'poItems')
      // .leftJoinAndSelect('po.requestedUser', 'requestedUser')
      .leftJoinAndSelect('po.issuedUser', 'issuedUser')
      .leftJoinAndSelect('po.issuedBy', 'issuedBy')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.assignedTechs', 'assignedTechs')
      .leftJoinAndSelect('assignedTechs.user', 'assignedTechs.user')
      .where('po.status < :status', { status: 4 })
      .orderBy('po.createdAt', 'DESC')
      .getMany();

    return orders;
  }

  async findAssignedOpenPurchaseOrders(userId, branchId) {
    return await this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.issuedUser', 'issuedUser')
      .leftJoinAndSelect('order.issuedBy', 'issuedBy')
      .leftJoinAndSelect('order.wo', 'wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      .where('order.status < :status', { status: 4 })
      .andWhere('issuedUser.id = :userId', { userId })
      .andWhere('branch.id = :branchId', { branchId })
      .groupBy('order.id')
      .addGroupBy('issuedUser.id')
      .addGroupBy('issuedBy.id')
      .addGroupBy('wo.id')
      .addGroupBy('wo.number')
      .addGroupBy('customer.id')
      .addGroupBy('branch.id')
      .getMany();
  }

  async sendEmailWhenPOIssued(po, company) {
    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        0,
        1,
        0,
        po.wo.branch.id,
        company,
      );
      let recipientEmailArray = await this.userService.getRecipientEmailArray(
        item,
      );
      const mailOptions = {
        from: config.mail.supportEmail,
        to: recipientEmailArray,
        subject: 'PO # ' + po.number + ' issued for WO# ' + po.wo.number,
        text: 'PO # ' + po.number + ' issued for WO# ' + po.wo.number,
        html:
          `PO#: ${po.number}` +
          '<br/>' +
          `Payment Type: ${paymentItems[po.paymentType]}` +
          '<br/>' +
          `Issued For: ${po.issuedUser ? po.issuedUser.name : ''}` +
          '<br/>' +
          `Issued By: ${po.issuedBy ? po.issuedBy.name : ''}` +
          '<br/>' +
          `Vendor: ${po.vendor}` +
          '<br/>' +
          `Description: ${po.description}` +
          '<br/>' +
          `WO: ${po.wo.number}` +
          '<br/>' +
          `WO Description: ${po.wo.description}` +
          '<br/>' +
          `Customer: ${po.wo.customer.companyName}` +
          '<br/>',
      };
      this.emailService.sendEmail(mailOptions);
    } catch (error) {
      console.log('Sending WO issue email error: ', error);
    }
  }

  async saveHistory(woId, eventUser, message) {
    let data = {
      wo: woId,
      description: message,
    };
    if (eventUser) {
      data['user'] = eventUser.id;
    }
    await this.historyService.create(data);
  }

  async generatePOReceipt(poId, company) {
    //completed
    try {
      let po = await this.findByPoId(poId);
      const companyData: CompanyEntity = await this.companyService.get(company);

      let technicians = '';
      if (po.wo.assignedTechs) {
        let primaryTech = po.wo.assignedTechs.find((obj) => obj.roleId === 0);
        if (primaryTech) {
          let currentIndex = po.wo.assignedTechs.findIndex(
            (obj) => obj.roleId === 0,
          );
          po.wo.assignedTechs.splice(currentIndex, 1);
          po.wo.assignedTechs.splice(0, 0, primaryTech);
        }
        let techNames = po.wo.assignedTechs.map((obj) => obj.user.name);
        technicians = techNames.join();
      }

      let attachmentArray = [];
      if (po.attachments) {
        for (let attachment of po.attachments) {
          attachmentArray.push({
            URL: getPoReceiptUrl(company, attachment),
            name: getRealFileName(attachment),
          });
        }
      }

      let poItems = [];
      for (let item of po.poItems) {
        poItems.push({
          ...item,
          URL: getUploadUrl(company, item.attachment),
          realFileName: getRealFileName(item.attachment),
        });
      }

      const data = {
        companyLogo: companyData
          ? `${API_URL}/${company}/company/logo.png`
          : '',
        companyAddress: po.wo.branch.address,
        companyPhone: po.wo.branch.phone,
        companyWebsite: companyData ? companyData.website : '',
        poNumber: po.number,
        date: formatDate(new Date().toISOString()),
        poType: paymentItems[po.paymentType],
        woNumber: po.wo.number,
        vendor: po.vendor,
        customerCompany: po.wo.customer.companyName,
        poDescription: po.description,
        poNote: po.note,
        technicians: technicians,
        issuedBy: po.issuedBy?.name,
        issuedFor: po.issuedUser?.name,
        attachments: attachmentArray,
        poItems: poItems,
      };

      let path = 'src/core/templates/poreceipt/poreceipt_template.html';
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'staging'
      ) {
        path = 'core/templates/poreceipt/poreceipt_template.html';
      }

      const template = await fs.promises.readFile(path, 'utf-8');

      const renderedHtml = ejs.render(template, data);

      let options = {
        format: 'A4',
        width: '8.5in',
        height: '11in',
        title: 'Service Ticket',
        margin: { top: 40, left: 20, right: 20, bottom: 20 },
      };
      let file = { content: renderedHtml };

      const pdfBuffer = await htmlPDF.generatePdf(file, options);

      const fileName = 'PO_Report_' + String(po.number) + '.pdf';
      const filePath = `./public/${company}/poreceipt/${fileName}`;

      await fs.promises.writeFile(filePath, pdfBuffer);
      return true;
    } catch (error) {
      console.log('generating PO receipt error: ', error);
    }
  }

  async getAllOrderNumberWithKeyword(keyword, branchId) {
    let query = this.repo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.wo', 'wo')
      .leftJoinAndSelect('wo.branch', 'branch')
      .where('po.number ILike :searchString', { searchString: `%${keyword}%` });

    if (branchId != 0) {
      query = query.andWhere('branch.id = :branchId', {
        branchId,
      });
    }
    let orders = await query.getMany();
    const orderNumbers = orders.map((order) => order.number);
    return [...orderNumbers];
  }

  async deletePurchaseOrderByID(id, company) {
    const po = await this.repo.findOne({
      where: { id: id },
      relations: ['poItems'],
    });

    const { affected } = await this.repo.delete(id);
    if (affected > 0) {
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
      return true;
    } else {
      throw new NotFoundException(`PO not found`);
    }
  }

  async deleteAttachment(poId, index, company) {
    let po = await this.repo.findOneBy({ id: poId });
    let attachment = po.attachments[index];
    let newAttachments = [...po.attachments];
    newAttachments.splice(index, 1);
    if (attachment) {
      try {
        await fs.promises.unlink(`./public/${company}/poreceipt/${attachment}`);
        let result = await this.repo.update(poId, {
          attachments: newAttachments,
        });
        return true;
      } catch (error) {
        return error;
      }
    }
  }

  // BEGIN: REMOVE THIS CODE SOME TIME LATER
  async getPoCountByWoId(woId) {
    return await this.repo.count({
      where: {
        wo: {
          id: woId,
        },
      },
    });
  }
  // END: REMOVE THIS CODE SOME TIME LATER
}
