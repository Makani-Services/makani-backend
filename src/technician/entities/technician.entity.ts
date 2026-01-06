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
import { TimesheetEntity } from 'src/timesheet/entities/timesheet.entity';

@Entity('technician')
export class TechnicianEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.assignedAsTech)
  user: UserEntity;

  @ManyToOne(() => WoEntity, (wo) => wo.assignedTechs, { onDelete: 'CASCADE' })
  wo: WoEntity;

  @Column({ nullable: false })
  roleId: number; // 0: primary tech   1: secondary tech

  @Column({ nullable: false })
  status: number;
  // 0: request
  // 1: accepted
  // 2: rejected
  // 3: started
  // 4: resumed
  // 5: paused (leaved from the job)

  @Column({ nullable: false, default: 0 })
  techStatus: number;
  // 0: working/resume
  // 1: paused

  @Column({ type: 'timestamptz', nullable: true })
  acceptedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  rejectedDate: Date;

  @Column({ nullable: true })
  timesheet: string;

  @Column({ nullable: true })
  totalTimesheet: string;

  // @OneToMany(() => TimesheetEntity, (timesheet) => timesheet.technician)
  // timesheet: TimesheetEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TechnicianEntity> = {}) {
    Object.assign(this, data);
  }
}
