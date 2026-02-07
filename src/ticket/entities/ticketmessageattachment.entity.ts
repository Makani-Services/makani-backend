import { TicketMessageEntity } from './ticketmessage.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ticket_message_attachment')
export class TicketMessageAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TicketMessageEntity, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  message: TicketMessageEntity;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TicketMessageAttachmentEntity> = {}) {
    Object.assign(this, data);
  }
}
