import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { CustomerUserInviteEntity } from 'src/customer-user-invite/entities/customer-user-invite.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer_role')
export class CustomerRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  company: string;

  @ManyToMany(
    () => CustomerUserEntity,
    (customerUser) => customerUser.customerRoles,
  )
  @JoinTable()
  customerUsers: CustomerUserEntity[];

  @OneToMany(
    () => CustomerUserInviteEntity,
    (customerInvite) => customerInvite.customerRole,
  )
  customerInvites: CustomerUserInviteEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
