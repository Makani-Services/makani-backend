import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('company')
export class CompanyEntity {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  identifier: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  fax: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<CompanyEntity> = {}) {
    Object.assign(this, data);
  }
}
