import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';

@Entity('customer_refresh_session')
export class CustomerRefreshSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CustomerUserEntity, { onDelete: 'CASCADE' })
  customerUser: CustomerUserEntity;

  @Column()
  refreshToken: string;

  @Column()
  expiresIn: number;

  @Column()
  createdAt: number;
}
