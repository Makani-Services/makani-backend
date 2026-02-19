import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { WoEntity } from "./wo.entity";
import { WoAttachmentEntity } from "./woattachment.entity";

@Entity('wo_tag')
export class WoTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToMany(() => WoAttachmentEntity, (attachment) => attachment.tags)
  attachments: WoAttachmentEntity[];

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoTagEntity> = {}) {
    Object.assign(this, data);
  }
}