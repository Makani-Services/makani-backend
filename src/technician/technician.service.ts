import {
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { TechnicianEntity } from './entities/technician.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import * as nodemailer from 'nodemailer';
import { default as config } from '../config';
import { WoService } from 'src/wo/wo.service';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import {
  WO_TYPE_LIST,
  formatDate,
  getAssignedTechsNameArray,
  getFormattedTechName,
  timeToDecimal,
} from 'src/core/common/common';
import { HistoryService } from 'src/history/history.service';
import * as moment from 'moment';

@Injectable()
export class TechnicianService extends TypeOrmCrudService<TechnicianEntity> {
  constructor(
    @InjectRepository(TechnicianEntity) repo: Repository<TechnicianEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(WoEntity) private woRepo: Repository<WoEntity>,
    private readonly woService: WoService,
    private readonly pusherService: PusherService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly historyService: HistoryService,
  ) {
    super(repo);
  }

  async create(body, company) {
    const oldWO = await this.woRepo.findOne({
      where: { id: body.woId },
      relations: ['assignedTechs', 'assignedTechs.user'],
    });

    let techs = [];
    for (let item of body.data) {
      var newTech = new TechnicianEntity(item as CreateTechnicianDto);
      newTech.wo = body.woId;
      newTech.status = 0;

      const savedTech = await this.repo.save(newTech);
      const tech = await this.repo.findOne({
        where: {
          id: savedTech.id,
        },
        relations: ['user', 'wo', 'wo.customer', 'user.currentBranch', 'wo.branch'],
      });
      techs.push(tech);

      this.saveHistory(
        oldWO.id,
        body.eventUser,
        'Assigned WO to ' + tech.user.name,
      );
    }

    //Send email notification
    const newWO = await this.woRepo.findOne({
      where: { id: body.woId },
      relations: [
        'requestedUser',
        'openUser',
        'customer',
        'serviceTicketProvider',
        'assignedTechs',
        'assignedTechs.user',
        'pos',
        'pos.poItems',
        'branch',
      ],
    });
    if (oldWO.assignedTechs.length === 0) {
      try {
        let type = 0;

        switch (newWO.type) {
          case 0:
            type = 0;
            break;
          case 1:
            type = 6;
            break;
          case 2:
            type = 7;
            break;
          case 3:
            type = 8;
            break;
        }
        let item: NotificationEntity =
          await this.notificationService.getOneItem(
            0,
            0,
            type,
            newWO.branch.id,
            company,
          );

        if (item) {
          let recipientEmailArray =
            await this.userService.getRecipientEmailArray(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray,
            subject:
              'New WO# ' + newWO.number + ', ' + newWO.customer.companyName,
            text: 'New WO# ' + newWO.number + ', ' + newWO.customer.companyName,
            html:
              'WO#: ' +
              newWO.number +
              '<br/>' +
              'Type of WO#: ' +
              WO_TYPE_LIST[newWO.type] +
              '<br/>' +
              'Customer Name: ' +
              newWO.customer.companyName +
              '<br/>' +
              'Description: ' +
              newWO.description +
              '<br/>' +
              'Technician: ' +
              getAssignedTechsNameArray(newWO.assignedTechs),
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (e) {
        console.log(e);
      }
    }

    //send push notification to tech app
    const userIds = [];
    for (let tech of techs) {
      userIds.push(tech.user.email);
    }
    const wo = await this.woService.findBasicWorkOrdersById(body.woId);
    this.pusherService.sendPushNotification(
      userIds,
      'Work Order assigned',
      'Work Order(' + wo.number + ') is assigned to you',
      { screen: 'jobs/requested' },
    );

    //send email notification
    for (let tech of techs) {
      this.sendEmailNotification(tech.user, tech.wo);
    }

    return techs;
  }

  async updateBulkTechnician(woId, updatedTechArray) {
    for (let item of updatedTechArray) {
      let tech = await this.repo.findOne({
        where: { wo: { id: woId }, user: { id: item.user } },
        relations: ['wo', 'user'],
      });
      // Object.assign(tech, data);
      tech.roleId = item.roleId;
      try {
        await this.repo.save(tech);
      } catch {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return true;
  }

  async update(id: number, data: UpdateTechnicianDto, headers) {
    const tech = await this.repo.findOne({
      where: {
        id,
      },
      relations: ['user', 'wo', 'wo.customer'],
    });

    Object.assign(tech, data);
    await this.repo.save(tech);

    return await this.repo.findOne({
      where: { id },
      relations: ['user', 'wo', 'wo.customer'],
    });
  }

  async updateBulkTimesheet(techArray) {
    let objectData = JSON.parse(techArray);
    for (let tech of objectData) {
      let techEntity = await this.repo.findOne({ where: { id: tech.id } });

      // Object.assign(tech, data);
      techEntity.timesheet = tech.timesheet && JSON.stringify(tech.timesheet);
      techEntity.totalTimesheet = JSON.stringify(tech.totalTimesheet);
      try {
        await this.repo.save(techEntity);
      } catch {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return true;
  }

  async delete(woId, removedTechArray, eventUser) {
    let userIds = [];
    for (let tech of removedTechArray) {
      userIds.push(tech.user);

      //save history
      // this.saveHistory(woId, tech, eventUser)
      let techUser = await this.userRepo.findOne({ where: { id: tech.user } });
      this.saveHistory(woId, eventUser, `Removed ${techUser.name} from WO`);
    }

    try {
      await this.repo
        .createQueryBuilder()
        .delete()
        .where('woId = :woId', { woId: woId })
        .andWhere('userId IN (:...userIds)', { userIds: userIds })
        .execute();
      return true;
    } catch {
      (error) => {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      };
    }
  }

  async sendEmailNotification(user: UserEntity, wo: WoEntity) {

    let message = "A new Work Order has been assigned to you";
    if (user.currentBranch?.id !== wo.branch.id) {
      message = `A new Work Order has been assigned to you from ${wo.branch.name}, make sure you are in the correct branch`;
    }

    const mailOptions = {
      from: config.mail.supportEmail,
      to: user.email, // list of receivers (separated by ,)
      subject: 'New Order # ' + wo.number + ' is assigned to you',
      text: ' ',
      html:
        'Hi ' +
        user.name +
        '! <br><br> ' + message + ': <br>' +
        'WO #: ' +
        wo.number +
        '<br>' +
        'Customer: ' +
        wo.customer.companyName +
        '<br>' +
        'Description: ' +
        wo.description,
    };

    let result = false;
    try {
      result = await this.emailService.sendEmail(mailOptions);
    } catch (error) {
      console.log('Email Sending Error: ', error);
    }
    return result;

    // return sent;
  }

  async acceptOrder(userId, orderId, company) {
    const tech = await this.repo.findOne({
      where: { user: { id: userId }, wo: { id: orderId } },
      relations: ['user', 'wo'],
    });
    tech.status = 1;
    tech.acceptedDate = new Date();

    let wo = await this.woService.findBasicWorkOrdersById(orderId);

    //save history
    try {
      this.saveHistory(orderId, tech.user, 'Accepted the work order');
    } catch (e) {
      console.log('Error saving history when accepting order: ', e);
    }

    //send push notification
    try {
      let item: NotificationEntity = await this.notificationService.getOneItem(
        1,
        0,
        0,
        wo.branch.id,
        company,
      );
      if (item) {
        let recipientEmailArray = await this.userService.getRecipientEmailList(
          item,
        );
        this.pusherService.sendPushNotification(
          recipientEmailArray,
          tech.user.name + ' accepted the work order',
          'Work order number is ' + tech.wo.number,
        );
      }
    } catch (e) {
      console.log('Error accepting order when sending push notification: ', e);
    }

    return this.repo.save(tech);
  }

  async rejectOrder(userId, orderId) {
    const tech = await this.repo.findOne({
      where: { user: { id: userId }, wo: { id: orderId } },
      relations: ['user', 'wo'],
    });
    tech.status = 2;
    tech.rejectedDate = new Date();

    //save history
    try {
      this.saveHistory(orderId, tech.user, 'Rejected the work order');
    } catch (e) {
      console.log('Error saving history when rejecting order: ', e);
    }

    return this.repo.save(tech);
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

  async getTimeCards(userId, startDate, endDate, branchId) {
    let query = this.repo
      .createQueryBuilder('technician')
      .leftJoinAndSelect('technician.user', 'user')
      .leftJoinAndSelect('technician.wo', 'wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      .where('user.id = :userId', { userId });

    if (branchId > 0) {
      query = query.andWhere('branch.id = :branchId', { branchId });
    }

    let timesheetArray = await query.getMany();
    let timeCardData = [];
    for (let i = 0; i < timesheetArray.length; i++) {
      if (timesheetArray[i].timesheet && timesheetArray[i].wo.startDate) {
        for (let timesheet of JSON.parse(timesheetArray[i].timesheet)) {
          //check the timesheet with startDate and endDate
          let workDate = moment(timesheetArray[i].wo.startDate)
            .add(timesheet.dayDiff, 'days')
            .format('YYYY-MM-DD');
          if (
            moment(workDate).isSameOrAfter(moment(startDate), 'day') &&
            moment(workDate).isSameOrBefore(moment(endDate), 'day') &&
            (timesheet.regularTime || timesheet.overTime || timesheet.travelTime)
          ) {
            let item = {
              customer: timesheetArray[i].wo.customer.companyName,
              woNumber: timesheetArray[i].wo.number,
              date: workDate,
              regularTime: timesheet.regularTime,
              overTime: timesheet.overTime,
              travelTime: timesheet.travelTime,
              branch: timesheetArray[i].wo.branch.name,
            };
            timeCardData.push(item);
          }
        }
      }
    }
    timeCardData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return timeCardData;
  }

  async getWeeklyTimeCards(userId, startDate, endDate) {
    let timesheetArray = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['user', 'wo', 'wo.customer'],
    });

    // if (userId === 14) {
    //   for (let timesheet of timesheetArray) {
    //     if (timesheet.wo.number === '95023') {
    //       console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀:', timesheet);
    //     }
    //   }
    // }

    let timeCardData = [];
    for (let i = 0; i < timesheetArray.length; i++) {
      if (timesheetArray[i].timesheet && timesheetArray[i].wo.startDate) {
        let timeArray = [];

        let weekRegularTimeForWo = 0,
          weekOverTimeForWo = 0,
          weekTotalTravelTimeForWo = 0;

        for (let timesheet of JSON.parse(timesheetArray[i].timesheet)) {
          //check the timesheet with startDate and endDate
          let workDate = moment(timesheetArray[i].wo.startDate)
            .add(timesheet.dayDiff, 'days')
            .format('MM/DD/YYYY');
          if (
            moment(workDate, 'MM/DD/YYYY').isSameOrAfter(
              moment(startDate, 'MM/DD/YYYY'),
              'day',
            ) &&
            moment(workDate, 'MM/DD/YYYY').isSameOrBefore(
              moment(endDate, 'MM/DD/YYYY'),
              'day',
            ) &&
            (timesheet.regularTime ||
              timesheet.overTime ||
              timesheet.travelTime)
          ) {
            let item = {
              offset: moment(workDate, 'MM/DD/YYYY').diff(
                moment(startDate, 'MM/DD/YYYY'),
                'days',
              ),
              date: workDate,
            };
            if (timesheet.regularTime) {
              item['regularTime'] = timeToDecimal(timesheet.regularTime);
              weekRegularTimeForWo += timeToDecimal(timesheet.regularTime);
            }
            if (timesheet.overTime) {
              item['overTime'] = timeToDecimal(timesheet.overTime);
              weekOverTimeForWo += timeToDecimal(timesheet.overTime);
            }
            if (timesheet.travelTime) {
              item['travelTime'] = timeToDecimal(timesheet.travelTime);
              weekTotalTravelTimeForWo += timeToDecimal(timesheet.travelTime);
            }
            timeArray.push(item);
          }
        }

        if (timeArray.length > 0) {
          timeCardData.push({
            customer: timesheetArray[i].wo.customer.companyName,
            woNumber: timesheetArray[i].wo.number,
            timeArray: timeArray,
            weekRegularTimeForWo: weekRegularTimeForWo,
            weekOverTimeForWo: weekOverTimeForWo,
            weekTotalTravelTimeForWo: weekTotalTravelTimeForWo,
          });
        }
      }
    }

    return timeCardData;
  }

  async getDailyTimeCards(userId, today) {
    let timesheetArray = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['user', 'wo', 'wo.customer'],
    });

    let timeCardData = [];
    for (let i = 0; i < timesheetArray.length; i++) {
      if (timesheetArray[i].timesheet && timesheetArray[i].wo.startDate) {
        for (let timesheet of JSON.parse(timesheetArray[i].timesheet)) {
          let workDate = moment(timesheetArray[i].wo.startDate)
            .add(timesheet.dayDiff, 'days')
            .format('MM/DD/YYYY');
          if (
            moment(workDate, 'MM/DD/YYYY').isSame(
              moment(today, 'MM/DD/YYYY'),
              'day',
            ) &&
            (timesheet.regularTime ||
              timesheet.overTime ||
              timesheet.travelTime)
          ) {
            let item = {};
            if (timeCardData.length === 0) {
              item['name'] = getFormattedTechName(timesheetArray[i].user.name);
            } else {
              item['name'] = '';
            }
            let hours = 0;
            if (timesheet.regularTime) {
              hours += timeToDecimal(timesheet.regularTime);
            }
            if (timesheet.overTime) {
              hours += timeToDecimal(timesheet.overTime);
            }
            if (timesheet.travelTime) {
              hours += timeToDecimal(timesheet.travelTime);
            }
            item['hours'] = hours;
            item['woNumber'] = timesheetArray[i].wo.number;
            item['customer'] = timesheetArray[i].wo.customer.companyName;
            item['woDescription'] = timesheetArray[i].wo.description;

            timeCardData.push(item);
          }
        }
      }
    }

    if (timeCardData.length === 0) {
      let tech = await this.userService.getUserById(userId);
      timeCardData.push({
        name: getFormattedTechName(tech.name),
        hours: 'N/R',
        woNumber: 'N/R',
        customer: '',
        woDescription: '',
      });
    }

    return timeCardData;
  }
}
