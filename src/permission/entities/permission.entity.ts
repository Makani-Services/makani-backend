// import { MenuEntity } from 'src/menu/entities/menu.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  description: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];

  // @ManyToMany(() => MenuEntity, (menu) => menu.permissions)
  // menus: MenuEntity[];
}
