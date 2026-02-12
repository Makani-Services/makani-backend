import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';

@Entity('customer_note')
export class CustomerNoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  senderType: number;
  // 0: sender is technician/admin/clerical (UserEntity)
  // 1: sender is customer (CustomerUserEntity)

  @ManyToOne(() => WoEntity, (wo) => wo.customerNotes)
  wo: WoEntity;

  @ManyToOne(() => UserEntity, (user) => user.sentCustomerNotes)
  sender: UserEntity;

  @ManyToOne(
    () => CustomerUserEntity,
    (customerUser) => customerUser.sentCustomerNotes,
  )
  customerSender: CustomerUserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CustomerNoteEntity> = {}) {
    Object.assign(this, data);
  }
}
