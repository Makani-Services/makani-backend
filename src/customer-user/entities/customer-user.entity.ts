import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { CustomerUserInviteEntity } from 'src/customer-user-invite/entities/customer-user-invite.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity({ name: 'customer_user' })
export class CustomerUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ default: true })
  isEnabled: boolean;

  @ManyToOne(() => CustomerEntity, (customer) => customer.users)
  customer: CustomerEntity;

  @OneToMany(
    () => CustomerUserInviteEntity,
    (invite) => invite.invitedByAdmin,
    {
      cascade: true,
    },
  )
  invitedByAdmins: CustomerUserInviteEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.requestedCustomerUser)
  requestedWOs: WoEntity[];

  @ManyToMany(
    () => CustomerRoleEntity,
    (customerRole) => customerRole.customerUsers,
  )
  customerRoles: CustomerRoleEntity[];

  @ManyToMany(
    () => CustomerLocationEntity,
    (customerLocation) => customerLocation.customerUsers,
  )
  customerLocations: CustomerLocationEntity[];

  @OneToMany(
    () => CustomerNoteEntity,
    (customerNote) => customerNote.customerSender,
  )
  sentCustomerNotes: CustomerNoteEntity[];

  @Column({ nullable: true })
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CustomerUserEntity> = {}) {
    Object.assign(this, data);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      if (!/^\$2[abxy]?\$\d+\$/.test(this.password)) {
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(plainPassword, this.password);
  }
}
