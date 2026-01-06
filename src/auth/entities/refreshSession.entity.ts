import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';

@Entity('refresh_session')
// @Index(['refreshToken'])
// @Unique('refreshToken', ['refreshToken'])
export class RefreshSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  refreshToken: string;

  @Column()
  expiresIn: number;

  @Column()
  createdAt: number;
}
