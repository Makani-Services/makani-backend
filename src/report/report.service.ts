import { Injectable, NotFoundException } from '@nestjs/common';
import writeXlsxFile from 'write-excel-file/node';
import * as fs from 'fs';

import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ReportEntity } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment';
import { TechnicianService } from 'src/technician/technician.service';
import { default as config } from '../config';
import { EmailService } from 'src/email/email.service';
import { BranchService } from 'src/branch/branch.service';
import {
  formatDate,
  getFormattedTechName,
  timezoneMap,
} from 'src/core/common/common';
@Injectable()
export class ReportService extends TypeOrmCrudService<ReportEntity> {
  constructor(
    @InjectRepository(ReportEntity) repo: Repository<ReportEntity>,
    private readonly userService: UserService,
    private readonly technicianService: TechnicianService,
    private readonly emailService: EmailService,
    private readonly branchService: BranchService,
  ) {
    super(repo);
  }

  async create(data, company: string) {
    const reportData = { ...data, company };
    return await this.repo.save(reportData);
  }

  async getAll(branch: number, company: string) {
    return await this.repo.find({
      where: {
        branch: { id: branch },
        company: company,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async getAllReport(company: string) {
    return await this.repo.find({
      where: { company: company },
      relations: ['branch'],
    });
  }

  async delete(id: number, company: string) {
    const report = await this.repo.findOne({
      where: { id, company },
    });

    if (!report) {
      throw new NotFoundException(
        `Report with ID ${id} not found for company ${company}`,
      );
    }

    await this.repo.delete(id);
  }

  async update(id: number, data: any, company: string) {
    const item = await this.repo.findOne({
      where: { id, company },
    });

    if (!item) {
      throw new NotFoundException(
        `Report with ID ${id} not found for company ${company}`,
      );
    }

    Object.assign(item, data);
    return this.repo.save(item);
  }

  async sendHoursWorkedReport(
    branchId: number,
    recipients: string[],
    past7Days: boolean,
    past30Days: boolean,
    date: string,
    customDays: boolean,
    customStartDate: string,
    customEndDate: string,
    company: string,
  ) {
    const schema = [
      {
        column: 'Technician',
        type: String,
        width: 25,
        wrap: true,
        align: 'right',
        alignVertical: 'center',
        value: (order) => order.technician,
      },
      {
        column: 'Customer',
        type: String,
        width: 35,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.customer,
      },
      {
        column: 'Branch',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.branch,
      },
      {
        column: 'WO #',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.woNumber,
      },
      {
        column: 'Date',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.date,
      },
      {
        column: 'Regular Time',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.regularTime,
      },
      {
        column: 'Over Time',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.overTime,
      },
    ];

    let branch = await this.branchService.getBranchById(branchId);

    let technicians = await this.userService.getUsersWithRole(
      'Technician',
      branchId,
      company,
    );
    let managers = await this.userService.getUsersWithRole(
      'Manager',
      branchId,
      company,
    );
    let userArray = [...technicians, ...managers];
    userArray = userArray.filter((user) => user.isEnabled);
    // Sort technicians alphabetically by last name and first name
    userArray = userArray.sort((a, b) => {
      const formattedNameA = getFormattedTechName(a.name);
      const formattedNameB = getFormattedTechName(b.name);
      return formattedNameA.localeCompare(formattedNameB);
    });

    let recipientEmailArray =
      await this.userService.getRecipientEmailListForReport(
        recipients.join(),
        company,
      );

    let startDateForPast7Days, startDateForPast30Days;
    let startDateForCustom, endDateForCustom;

    if (past7Days) {
      startDateForPast7Days = moment(date)
        .subtract(7, 'days')
        .startOf('day')
        .toDate();
    }

    if (past30Days) {
      startDateForPast30Days = moment(date)
        .subtract(30, 'days')
        .startOf('day')
        .toDate();
    }

    if (customDays) {
      startDateForCustom = moment(customStartDate, 'MM/DD/YYYY').toDate();
      endDateForCustom = moment(customEndDate, 'MM/DD/YYYY').toDate();
    }

    let endDate = moment()
      .tz(timezoneMap[branch.timezone])
      .format('YYYY-MM-DD');

    // Create company-specific reports directory if it doesn't exist
    const reportsDir = `./public/${company}/reports`;
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    if (past7Days) {
      let timeCardsForPast7Days = [];
      for (let tech of userArray) {
        let timeCards = await this.technicianService.getTimeCards(
          tech.id,
          startDateForPast7Days,
          endDate,
          branchId,
        );
        const updatedtimeCards = timeCards.map((item) => ({
          ...item,
          technician: getFormattedTechName(tech.name),
        }));
        timeCardsForPast7Days.push(...updatedtimeCards);
      }

      const fileName = `Hours Worked Report for the past 7 days.xlsx`;
      const filePath = `${reportsDir}/${fileName}`;

      await writeXlsxFile(timeCardsForPast7Days, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePath,
      });

      let attachment = fs.readFileSync(filePath).toString('base64');

      try {
        const mailOptions = {
          from: config.mail.supportEmail,
          to: recipientEmailArray,
          subject: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          text: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          html: `Hours Worked Report for ${branch.name} <br/> 
          Report Begin Date: ${formatDate(
            startDateForPast7Days,
            'MM/DD/YYYY',
          )} <br/>
          Report End Date: ${formatDate(date, 'MM/DD/YYYY')} <br/>`,
          attachments: [
            {
              content: attachment,
              filename: fileName,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              disposition: 'attachment',
            },
          ],
        };

        let result = await this.emailService.sendEmail(mailOptions);
      } catch (e) {
        console.log('Error sending 7-day hours worked report email:', e);
        throw new Error(
          `Failed to send 7-day hours worked report email: ${e.message}`,
        );
      }
    }

    if (past30Days) {
      let timeCardsForPast30Days = [];
      for (let tech of userArray) {
        let timeCards = await this.technicianService.getTimeCards(
          tech.id,
          startDateForPast30Days,
          endDate,
          branchId,
        );
        const updatedtimeCards = timeCards.map((item) => ({
          ...item,
          technician: getFormattedTechName(tech.name),
        }));
        timeCardsForPast30Days.push(...updatedtimeCards);
      }

      const fileName = `Hours Worked Report for the past 30 days.xlsx`;
      const filePath = `${reportsDir}/${fileName}`;

      await writeXlsxFile(timeCardsForPast30Days, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePath,
      });

      let attachment = fs.readFileSync(filePath).toString('base64');

      try {
        const mailOptions = {
          from: config.mail.supportEmail,
          to: recipientEmailArray,
          subject: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          text: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          html: `Hours Worked Report for ${branch.name} <br/> 
          Report Begin Date: ${formatDate(
            startDateForPast30Days,
            'MM/DD/YYYY',
          )} <br/>
          Report End Date: ${formatDate(date, 'MM/DD/YYYY')} <br/>`,
          attachments: [
            {
              content: attachment,
              filename: fileName,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              disposition: 'attachment',
            },
          ],
        };

        let result = await this.emailService.sendEmail(mailOptions);
      } catch (e) {
        console.log('Error sending 30-day hours worked report email:', e);
        throw new Error(
          `Failed to send 30-day hours worked report email: ${e.message}`,
        );
      }
    }

    if (customDays) {
      let timeCardsForCustomDays = [];
      for (let tech of userArray) {
        let timeCards = await this.technicianService.getTimeCards(
          tech.id,
          startDateForCustom,
          endDateForCustom,
          branchId,
        );
        const updatedtimeCards = timeCards.map((item) => ({
          ...item,
          technician: getFormattedTechName(tech.name),
        }));
        timeCardsForCustomDays.push(...updatedtimeCards);
      }

      const fileName = `Hours Worked Report FROM ${formatDate(
        customStartDate,
        'MM_DD_YYYY',
      )} TO ${formatDate(customEndDate, 'MM_DD_YYYY')}.xlsx`;
      const filePath = `${reportsDir}/${fileName}`;

      await writeXlsxFile(timeCardsForCustomDays, {
        schema,
        headerStyle: {
          backgroundColor: '#eeeeee',
          fontWeight: 'bold',
          align: 'center',
        },
        filePath: filePath,
      });

      let attachment = fs.readFileSync(filePath).toString('base64');

      try {
        const mailOptions = {
          from: config.mail.supportEmail,
          to: recipientEmailArray,
          subject: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          text: `${branch.name} Hours Worked Report ${formatDate(
            date,
            'MM/DD/YYYY',
          )}`,
          html: `Hours Worked Report for ${branch.name} <br/> 
          Report Begin Date: ${formatDate(
            startDateForCustom,
            'MM/DD/YYYY',
          )} <br/>
          Report End Date: ${formatDate(endDateForCustom, 'MM/DD/YYYY')} <br/>`,
          attachments: [
            {
              content: attachment,
              filename: fileName,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              disposition: 'attachment',
            },
          ],
        };

        let result = await this.emailService.sendEmail(mailOptions);
      } catch (e) {
        console.log('Error sending custom days hours worked report email:', e);
        throw new Error(
          `Failed to send custom days hours worked report email: ${e.message}`,
        );
      }
    }
  }
}
