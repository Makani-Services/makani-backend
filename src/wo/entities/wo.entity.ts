import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { WoMaterialEntity } from 'src/material/entities/wo-material.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { WoAttachmentEntity } from './woattachment.entity';

@Entity('wo')
export class WoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  company: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.wos)
  customer: CustomerEntity;

  @ManyToOne(
    () => CustomerLocationEntity,
    (customerLocation) => customerLocation.wos,
  )
  customerLocation: CustomerLocationEntity;

  @OneToMany(() => PoEntity, (po) => po.wo)
  pos: PoEntity[];

  @Column({ nullable: true })
  @Index()
  number: string;

  @Column({ nullable: true })
  asset: string;

  @Column({ nullable: true })
  customerPONumber: string;

  @Column({ nullable: true })
  servicesProvided: string;

  @Column({ nullable: true })
  signerName: string;

  @Column({ type: 'timestamp', nullable: true })
  stSignedDate: Date;

  @Column({ nullable: true })
  @Index()
  status: number;
  // 0: requested
  // 1: open/issued
  // 2: enroute
  // 3: arrived
  // 4: parts
  // 5: complete(submitted)  (technician submitted ST to clerical/manager for review)
  // 6: reviewed(sent) (clerical/manager sent ST To customers)

  // 100: billed(closed)
  // 101: cancelled

  @Column({ type: 'timestamptz', nullable: true })
  enrouteDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  arrivedDate: Date;

  @Column({ nullable: true })
  @Index()
  type: number; //0: service call ,  1: quoted,  2: PM,  3: Parts Only

  @ManyToOne(() => UserEntity, (user) => user.quotedWO)
  quotedBy: UserEntity;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  NTE: number;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledStartDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledTargetDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  // @Column({ type: 'timestamptz', nullable: true })
  // billedDate: Date;

  // @Column({ nullable: true })
  // billedNote: string;

  @Column({ type: 'json', nullable: true })
  billedData: { date: string; note: string }[];

  @ManyToOne(() => UserEntity, (user) => user.requestWO)
  requestedUser: UserEntity;

  @ManyToOne(
    () => CustomerUserEntity,
    (customerUser) => customerUser.requestedWOs,
  )
  requestedCustomerUser: CustomerUserEntity;

  @Column({ type: 'timestamptz', nullable: true })
  requestedDate: Date; //issued date

  @ManyToOne(() => UserEntity, (user) => user.openWO)
  openUser: UserEntity;

  @Column({ type: 'timestamptz', nullable: true }) //approved date by manager/admin
  openDate: Date;

  @ManyToOne(() => UserEntity, (user) => user.closedWO)
  closedUser: UserEntity;

  @Column({ type: 'timestamptz', nullable: true })
  closedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedDate: Date;

  // @Column({ nullable: true, type: 'varchar', array: true })
  // attachments: string[];

  @OneToMany(() => WoAttachmentEntity, (attachment) => attachment.wo)
  attachments: WoAttachmentEntity[];

  @Column({ nullable: true, type: 'varchar', array: true })
  proposals: string[];

  @OneToMany(() => TechnicianEntity, (tech) => tech.wo)
  assignedTechs: TechnicianEntity[];

  //service ticket data start
  // @Column({ default: false })
  // isServiceTicketSubmitted: boolean;

  @Column({ default: false, nullable: true })
  isServiceTicketEdited: boolean;

  // @Column({ default: false })
  // isServiceTicketSent: boolean;

  @ManyToOne(() => UserEntity, (user) => user.STsubmittedWo)
  serviceTicketProvider: UserEntity;

  @Column({ type: 'timestamptz', nullable: true })
  stSentDate: Date;

  @Column({ nullable: true })
  recommendations: string;

  @Column({ nullable: true })
  recommendationStatus: number;
  // 0 or null: pending
  // 1: accepted
  // 2: dismissed

  @Column({ nullable: true })
  priorityLevel: number;

  @Column({ nullable: true })
  materials: string; //other materials

  // @Column({ nullable: true })
  // isRefrigerantAdded: boolean;

  // @Column({ nullable: true })
  // refrigerantType: string;

  // @Column({ nullable: true })
  // refrigerantQuantity: number;

  @Column({ nullable: true })
  ticketReceipients: string;
  //service ticket data end

  @OneToMany(() => HistoryEntity, (history) => history.wo)
  history: HistoryEntity[];

  @OneToMany(() => CustomerNoteEntity, (customerNote) => customerNote.wo)
  customerNotes: CustomerNoteEntity[];

  @OneToMany(() => WoMaterialEntity, (woMaterial) => woMaterial.workOrder)
  materialsUsed: WoMaterialEntity[];

  // @Column({ nullable: true })
  // timesheetData: string;

  // @Column({ nullable: true })
  // timesheetTotalData: string;

  @ManyToOne(() => BranchEntity, (branch) => branch.wo)
  branch: BranchEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoEntity> = {}) {
    Object.assign(this, data);
  }
}
