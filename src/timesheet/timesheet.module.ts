import { Module } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { TimehseetController } from './timesheet.controller';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RoleEntity } from 'src/role/entities/role.entity';
import { TimesheetEntity } from './entities/timesheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimesheetEntity,
      UserEntity,
      WoEntity,
      RoleEntity,
    ]),
  ],
  controllers: [TimehseetController],
  providers: [TimesheetService, JwtService],
})
export class TimesheetModule {}
