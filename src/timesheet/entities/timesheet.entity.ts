import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/role/entities/role.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { RefreshSessionEntity } from 'src/auth/entities/refreshSession.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';

@Entity('timesheet')
export class TimesheetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => TechnicianEntity, (technician) => technician.timesheet)
  // technician: TechnicianEntity;

  @Column({ nullable: true, type: 'date' })
  regularTime: number;

  @Column({ nullable: true, type: 'date' })
  overTime: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TimesheetEntity> = {}) {
    Object.assign(this, data);
  }
}
