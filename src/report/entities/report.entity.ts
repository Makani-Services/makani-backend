import { Branch, BranchEntity } from 'src/branch/entities/branch.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('report')
export class ReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BranchEntity, (branch) => branch.reportBranch)
  branch: BranchEntity;

  @Column({ nullable: true })
  type: number;
  // 0: Open WOs
  // 1: Closed WOs

  // 10: Open POs

  // 20: Time Cards

  @Column({ nullable: true })
  technicians: string; // array of technician's id

  @Column({ nullable: true })
  recipients: string; // array of receivers id

  @Column({ nullable: true })
  cycle: number; // 0: weekly,  1: monthly,  2: daily

  @Column({ type: 'smallint', nullable: true })
  day: number;

  @Column({ type: 'time', nullable: true })
  time: string; // Use "HH:MM:SS" format when saving the time

  @Column({ nullable: true })
  @Index()
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  timezone: any;
}
