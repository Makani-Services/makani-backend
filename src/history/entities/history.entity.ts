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

@Entity('history')
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.eventUser)
  user: UserEntity;

  @ManyToOne(() => WoEntity, (wo) => wo.history, { onDelete: 'CASCADE' })
  wo: WoEntity;

  @Column({ nullable: false })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<HistoryEntity> = {}) {
    Object.assign(this, data);
  }
}
