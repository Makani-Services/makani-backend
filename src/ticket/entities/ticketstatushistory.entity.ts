
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Column } from "typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { TicketEntity } from "./ticket.entity";
import { CustomerUserEntity } from "src/customer-user/entities/customer-user.entity";

@Entity('ticket_status_history')
export class TicketStatusHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.statusHistories, { onDelete: 'CASCADE' })
  ticket: TicketEntity;

  @Column({ type: 'smallint', unsigned: true })
  fromStatus: number;

  @Column({ type: 'smallint', unsigned: true })
  toStatus: number;

  @ManyToOne(() => UserEntity)
  changedByUser: UserEntity;

  @ManyToOne(() => UserEntity)
  changedByCustomerUser: CustomerUserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<TicketStatusHistoryEntity> = {}) {
    Object.assign(this, data);
  }
}