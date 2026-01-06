import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('keyword')
export class KeywordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  keyword: string;

  @ManyToOne(() => UserEntity, (user) => user.keywords)
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<KeywordEntity> = {}) {
    Object.assign(this, data);
  }
}
