import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { CustomerUserInviteEntity } from 'src/customer-user-invite/entities/customer-user-invite.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { TicketEntity } from 'src/ticket/entities/ticket.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  email: string;

  @OneToMany(() => WoEntity, (wo) => wo.customer)
  wos: WoEntity[];

  @OneToMany(() => CustomerUserEntity, (user) => user.customer)
  users: CustomerUserEntity[];

  @OneToMany(() => CustomerLocationEntity, (location) => location.customer)
  locations: CustomerLocationEntity[];

  @OneToMany(() => CustomerUserInviteEntity, (invite) => invite.customer)
  invites: CustomerUserInviteEntity[];

  @OneToMany(() => TicketEntity, (ticket) => ticket.requesterCustomer)
  requestedTickets: TicketEntity[];

  @OneToMany(() => TicketEntity, (ticket) => ticket.createdByCustomer)
  createdTickets: TicketEntity[];

  @ManyToOne(() => BranchEntity, (branch) => branch.customer)
  branch: BranchEntity;

  @Column({ nullable: true })
  company: string;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CustomerEntity> = {}) {
    Object.assign(this, data);
  }
}
