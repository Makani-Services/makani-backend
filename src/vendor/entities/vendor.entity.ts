import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
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
  Index,
} from 'typeorm';

@Entity('vendor')
export class VendorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => BranchEntity, (branch) => branch.vendor)
  branch: BranchEntity;

  @Column({ nullable: true })
  @Index()
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<VendorEntity> = {}) {
    Object.assign(this, data);
  }
}
