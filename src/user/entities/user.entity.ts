import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/role/entities/role.entity';
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
  OneToOne,
} from 'typeorm';

import { RefreshSessionEntity } from 'src/auth/entities/refreshSession.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { ReportEntity } from 'src/report/entities/report.entity';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { InviteEntity } from 'src/invite/entities/invite.entity';
import { KeywordEntity } from 'src/keyword/entities/keyword.entity';
import { CustomerUserInviteEntity } from 'src/customer-user-invite/entities/customer-user-invite.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';

@Entity('user_entity')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, default: 'default.png' })
  avatar: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  @Exclude()
  emailVerified: boolean;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ nullable: true })
  hasLoggedHoursToday: boolean;

  @OneToMany(() => RefreshSessionEntity, (session) => session.user)
  @JoinTable()
  sessions: RefreshSessionEntity;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable()
  roles: RoleEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.requestedUser)
  requestWO: WoEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.openUser)
  openWO: WoEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.closedUser)
  closedWO: WoEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.quotedBy)
  quotedWO: WoEntity[];

  @OneToMany(() => TechnicianEntity, (tech) => tech.user)
  assignedAsTech: TechnicianEntity;

  @OneToMany(() => PoEntity, (po) => po.requestedUser)
  requestedPo: PoEntity;

  @OneToMany(() => PoEntity, (po) => po.issuedUser)
  issuedPo: PoEntity[];

  @OneToMany(() => PoEntity, (po) => po.issuedBy)
  PoIssuedBy: PoEntity[];

  @OneToMany(() => WoEntity, (wo) => wo.serviceTicketProvider)
  STsubmittedWo: WoEntity;

  @Column({ nullable: true })
  company: string;

  @OneToMany(() => HistoryEntity, (history) => history.user)
  eventUser: HistoryEntity[];

  @ManyToMany(() => BranchEntity, (branch) => branch.users)
  @JoinTable()
  branches: BranchEntity[];

  @OneToMany(() => InviteEntity, (invite) => invite.invitedBy, {
    cascade: true,
  })
  invitedBy: InviteEntity[];

  @OneToMany(() => CustomerUserInviteEntity, (invite) => invite.invitedBy, {
    cascade: true,
  })
  invitedByCustomerUsers: CustomerUserInviteEntity[];

  // @OneToMany(() => InviteEntity, (invite) => invite.invited)
  // invited: InviteEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => KeywordEntity, (keyword) => keyword.user, {
    cascade: true,
  })
  keywords: KeywordEntity[];

  @OneToMany(() => CustomerNoteEntity, (customerNote) => customerNote.sender)
  sentCustomerNotes: CustomerNoteEntity[];

  constructor(data: Partial<UserEntity> = {}) {
    Object.assign(this, data);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSalt();
    if (!/^\$2[abxy]?\$\d+\$/.test(this.password)) {
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
