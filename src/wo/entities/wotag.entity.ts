import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { WoEntity } from "./wo.entity";

@Entity('wo_tag')
export class WoTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => WoEntity, (wo) => wo.tag)
  wos: WoEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoTagEntity> = {}) {
    Object.assign(this, data);
  }
}