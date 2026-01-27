import { TicketEntity } from './ticket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ticket_attachment')
export class TicketAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.attachments, {
    onDelete: 'CASCADE',
  })
  ticket: TicketEntity;

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

  constructor(data: Partial<TicketAttachmentEntity> = {}) {
    Object.assign(this, data);
  }
}
