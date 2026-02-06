import { TicketEntity } from './ticket.entity';
import { TicketMessageAttachmentEntity } from './ticketmessageattachment.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ticket_message')
export class TicketMessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  ticket: TicketEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  senderUser?: UserEntity;

  @ManyToOne(() => CustomerEntity, { nullable: true })
  @JoinColumn({ name: 'senderCustomerId' })
  senderCustomer?: CustomerEntity;

  @OneToMany(() => TicketMessageAttachmentEntity, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments: TicketMessageAttachmentEntity[];

  @Column({ nullable: true })
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TicketMessageEntity> = {}) {
    Object.assign(this, data);
  }
}
