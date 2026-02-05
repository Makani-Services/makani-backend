import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
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

  @Column({ type: 'smallint', unsigned: true })
  status: number;

  // 0: open,   100: closed

  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy?: UserEntity;

  @OneToMany(() => TicketMessageEntity, (message) => message.ticket, {
    cascade: true,
  })
  messages: TicketMessageEntity[];

  @OneToMany(() => TicketAttachmentEntity, (attachment) => attachment.ticket, {
    cascade: true,
  })
  attachments: TicketAttachmentEntity[];

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
