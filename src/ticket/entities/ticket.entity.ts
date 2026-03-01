import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { TicketAttachmentEntity } from './ticketattachment.entity';
import { TicketMessageEntity } from './ticketmessage.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatusHistoryEntity } from './ticketstatushistory.entity';

@Entity('ticket')
export class TicketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  woNumber: string;

  @Column({ nullable: true })
  poNumber: string;

  @Column({ nullable: true })
  appVersion: string;

  @Column({ nullable: true })
  platform: string;

  @Column({ nullable: true })
  deviceModel: string;

  @Column({ nullable: true })
  deviceOS: string;

  @Column({ type: 'smallint', unsigned: true })
  status: number;
  // 0: open,   100: closed

  @ManyToOne(() => UserEntity, (user) => user.createdTickets, {
    nullable: true,
  })
  createdByUser?: UserEntity;

  @ManyToOne(() => CustomerUserEntity, (customerUser) => customerUser.createdTickets, {
    nullable: true,
  })
  createdByCustomer?: CustomerUserEntity;

  @ManyToOne(() => UserEntity, (user) => user.requestedTickets, {
    nullable: true,
  })
  requesterUser?: UserEntity;

  @ManyToOne(() => CustomerUserEntity, (customerUser) => customerUser.requestedTickets, {
    nullable: true,
  })
  requesterCustomer?: CustomerUserEntity;

  @ManyToOne(() => UserEntity, (user) => user.assignedTickets, {
    nullable: true,
  })
  assignedAgent?: UserEntity;

  @OneToMany(() => TicketMessageEntity, (message) => message.ticket, {
    cascade: true,
  })
  messages: TicketMessageEntity[];

  @OneToMany(() => TicketAttachmentEntity, (attachment) => attachment.ticket, {
    cascade: true,
  })
  attachments: TicketAttachmentEntity[];

  @OneToMany(() => TicketStatusHistoryEntity, (statusHistory) => statusHistory.ticket, {
    cascade: true,
  })
  statusHistories: TicketStatusHistoryEntity[];

  @Column({ nullable: true })
  @Index()
  company?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TicketEntity> = {}) {
    Object.assign(this, data);
  }
}
