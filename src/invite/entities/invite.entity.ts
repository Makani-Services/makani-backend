import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { BranchEntity } from 'src/branch/entities/branch.entity';

@Entity('invite')
export class InviteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({ default: false })
  accepted: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.invite)
  role: RoleEntity;

  @ManyToOne(() => BranchEntity, (branch) => branch.invite)
  branch: BranchEntity;

  @ManyToOne(() => UserEntity, (user) => user.invitedBy)
  invitedBy: UserEntity; //the user who sent the invitation

  @Column({ nullable: true })
  company: string;

  /*
  @ManyToOne(() => UserEntity, (user) => user.invited)
  invited: UserEntity; //the user who received the invitation
  */

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(partial?: Partial<InviteEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
