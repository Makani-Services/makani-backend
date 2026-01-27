import { TicketEntity } from './ticket.entity';
import { TicketMessageAttachmentEntity } from './ticketmessageattachment.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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
  sender?: UserEntity;

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
