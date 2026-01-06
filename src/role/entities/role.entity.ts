import { InviteEntity } from 'src/invite/entities/invite.entity';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 1 :   Administrator
  // 2 :   Manager
  // 3 :   Clerical
  // 4 :   Technician
  // 5 :   User
  // 100 : Accountant

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];

  @OneToMany(() => InviteEntity, (invite) => invite.role)
  invite: InviteEntity[];
}
