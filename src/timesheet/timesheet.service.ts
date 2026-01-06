import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import * as nodemailer from 'nodemailer';
import { default as config } from '../config';
import { TimesheetEntity } from './entities/timesheet.entity';

@Injectable()
export class TimesheetService extends TypeOrmCrudService<TimesheetEntity> {
  constructor(
    @InjectRepository(TimesheetEntity) repo: Repository<TimesheetEntity>,
  ) {
    super(repo);
  }

  async create(body) {
    var newTimesheet = new TimesheetEntity(body.data as CreateTimesheetDto);
    return await this.repo.save(newTimesheet);
  }

  async update(id: number, data: UpdateTimesheetDto) {
    let timesheet = await this.repo.findOne({
      where: { id: id },
      // relations: ['technician', 'wp'],
    });
    Object.assign(timesheet, data);
    // wo = data;
    return await this.repo.save(timesheet);
  }
}
