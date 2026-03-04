import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { WoEntity } from "./wo.entity";
import { UserEntity } from "src/user/entities/user.entity";


@Entity('wo_admin_note')
export class WoAdminNoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => WoEntity, (wo) => wo.adminNotes, { onDelete: 'CASCADE' })
  @Index()
  wo: WoEntity;

  @ManyToOne(() => UserEntity, (user) => user.adminNotes, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoAdminNoteEntity> = {}) {
    Object.assign(this, data);
  }
}