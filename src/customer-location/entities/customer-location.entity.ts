import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { CustomerUserInviteEntity } from 'src/customer-user-invite/entities/customer-user-invite.entity';
import { CustomerNotificationEntity } from 'src/customer-notification/entities/customer-notification.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';

@Entity('customer_location')
export class CustomerLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  timezone: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.locations)
  customer: CustomerEntity;

  @OneToMany(() => WoEntity, (wo) => wo.customerLocation)
  wos: WoEntity[];

  @OneToMany(
    () => CustomerUserInviteEntity,
    (invite) => invite.customerLocation,
  )
  customerInvites: CustomerUserInviteEntity[];

  @ManyToMany(() => CustomerUserEntity, (user) => user.customerLocations)
  @JoinTable()
  customerUsers: CustomerUserEntity[];

  @OneToMany(
    () => CustomerNotificationEntity,
    (notification) => notification.customerLocation,
  )
  customerNotifications: CustomerNotificationEntity[];

  // @Column({ nullable: true })
  // @Index()
  // company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CustomerLocationEntity> = {}) {
    Object.assign(this, data);
  }
}
