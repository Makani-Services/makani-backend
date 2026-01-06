import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('po')
export class PoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WoEntity, (wo) => wo.pos, { onDelete: 'CASCADE' })
  wo: WoEntity;

  @OneToMany(() => PoItemEntity, (poitem) => poitem.po)
  poItems: PoItemEntity[];

  @ManyToOne(() => UserEntity, (user) => user.requestedPo)
  requestedUser: UserEntity; //the user who requested the PO,  we don't need this for at least RSCS

  @ManyToOne(() => UserEntity, (user) => user.issuedPo)
  issuedUser: UserEntity; //technician who is reponsible for the PO,  corrent name should be issuedFor

  @ManyToOne(() => UserEntity, (user) => user.PoIssuedBy)
  issuedBy: UserEntity; //  admin/manager/clerical who issued the PO to the technician

  @Column({ type: 'timestamptz', nullable: true })
  issuedDate: Date;

  @Column({ nullable: true, default: '100001' })
  number: string;

  @Column({ nullable: false })
  status: number;

  // 0: requested     //This status is not needed anymore
  // 1: submitted by clerical for manager's approval     //This status is not needed anymore

  // 2: issued
  // 3: purchased
  // 4: complete

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  paymentType: number;

  // 0: Acct Credit
  // 1: Reimbursable
  // 2: Company CC

  @Column({ nullable: true, type: 'varchar', array: true })
  attachments: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<PoEntity> = {}) {
    Object.assign(this, data);
  }
}
