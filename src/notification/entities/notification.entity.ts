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
  Index,
} from 'typeorm';

import { RefreshSessionEntity } from 'src/auth/entities/refreshSession.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { TimesheetEntity } from 'src/timesheet/entities/timesheet.entity';
import { BranchEntity } from 'src/branch/entities/branch.entity';

@Entity('notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  type: number;
  // 0: Email Notification
  // 1: Web APP Notification
  // 2: Mobile App Notification
  // 3: SMS notification

  @Column({ nullable: false })
  flow: number; // 0: work order   1: purchase order

  @Column({ nullable: true })
  event: number;
  //if flow is 0, then 0: created/requested,  1: ST is sent
  //if flow is 1, then 0: issued,   1 completed,

  @Column({ nullable: true })
  recipientList: string;

  @ManyToOne(() => BranchEntity, (branch) => branch.notification)
  branch: BranchEntity;

  @Column({ nullable: true })
  @Index()
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<NotificationEntity> = {}) {
    Object.assign(this, data);
  }
}
