export class Branch {}
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { InviteEntity } from 'src/invite/entities/invite.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { ReportEntity } from 'src/report/entities/report.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { VendorEntity } from 'src/vendor/entities/vendor.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('branch')
export class BranchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  poStartNumber: string;

  @ManyToMany(() => UserEntity, (user) => user.branches)
  users: UserEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.branch)
  wo: WoEntity[];

  @OneToMany(() => CustomerEntity, (customer) => customer.branch)
  customer: CustomerEntity[];

  @OneToMany(() => VendorEntity, (vendor) => vendor.branch)
  vendor: VendorEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.branch)
  notification: NotificationEntity[];

  @OneToMany(() => InviteEntity, (invite) => invite.branch)
  invite: InviteEntity[];

  @OneToMany(() => ReportEntity, (report) => report.branch)
  reportBranch: ReportEntity[];

  @Column({ nullable: true })
  @Index()
  company: string;

  constructor(data: Partial<VendorEntity> = {}) {
    Object.assign(this, data);
  }
}
