import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { PoEntity } from 'src/po/entities/po.entity';
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

@Entity('poitem')
export class PoItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PoEntity, (po) => po.poItems, { onDelete: 'CASCADE' })
  po: PoEntity;

  @Column({ unique: true, nullable: false })
  number: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  attachment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<PoItemEntity> = {}) {
    Object.assign(this, data);
  }
}
