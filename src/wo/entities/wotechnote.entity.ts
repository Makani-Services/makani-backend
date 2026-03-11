import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { WoEntity } from "./wo.entity";
import { UserEntity } from "src/user/entities/user.entity";


@Entity('wo_tech_note')
export class WoTechNoteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => WoEntity, (wo) => wo.techNotes, { onDelete: 'CASCADE' })
  @Index()
  wo: WoEntity;

  @ManyToOne(() => UserEntity, (user) => user.techNotes, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoTechNoteEntity> = {}) {
    Object.assign(this, data);
  }
}