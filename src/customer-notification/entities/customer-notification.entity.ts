import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';

@Entity('customer_notification')
export class CustomerNotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  status: number;
  // 0: Work Order is issued
  // 1: Work Order is completed
  // 2: Work Order is billed
  // 10: New Work Order Note

  @Column({ nullable: false })
  type: number;
  // 0: Email Notification
  // 1: Web APP Notification
  // 2: Mobile App Notification
  // 3: SMS notification

  @Column({ nullable: true })
  recipientList: string;

  @Column({ nullable: true })
  @Index()
  company: string;

  @ManyToOne(
    () => CustomerLocationEntity,
    (location) => location.customerNotifications,
  )
  customerLocation: CustomerLocationEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CustomerNotificationEntity> = {}) {
    Object.assign(this, data);
  }
}
