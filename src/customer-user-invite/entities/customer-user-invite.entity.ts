import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';

@Entity('customer_user_invite')
export class CustomerUserInviteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({ default: false })
  accepted: boolean;

  @ManyToOne(() => CustomerEntity, (customer) => customer.invites)
  customer: CustomerEntity;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => UserEntity, (user) => user.invitedByCustomerUsers, {
    nullable: true,
  })
  invitedBy: UserEntity; //the user who sent the invitation (like admin/manager of RSCS)

  @ManyToOne(() => CustomerUserEntity, (user) => user.invitedByAdmins, {
    nullable: true,
  })
  invitedByAdmin: CustomerUserEntity; //the admin of the customer who sent the invitation to their employee

  @ManyToOne(
    () => CustomerRoleEntity,
    (customerRole) => customerRole.customerInvites,
  )
  customerRole: CustomerRoleEntity;

  @ManyToOne(
    () => CustomerLocationEntity,
    (customerLocation) => customerLocation.customerInvites,
  )
  customerLocation: CustomerLocationEntity;

  @Column({ nullable: true })
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(partial?: Partial<CustomerUserInviteEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
