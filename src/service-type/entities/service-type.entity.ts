import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service_type')
export class ServiceTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  serviceType: string;

  @Column({ nullable: false })
  backgroundColor: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  company: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<ServiceTypeEntity> = {}) {
    Object.assign(this, data);
  }
}
