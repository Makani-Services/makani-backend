import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialCategoryEntity } from './material-category.entity';
import { WoMaterialEntity } from './wo-material.entity';

@Entity('material_type')
export class MaterialTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(
    () => MaterialCategoryEntity,
    (category) => category.materialTypes,
    { nullable: false },
  )
  category: MaterialCategoryEntity;

  @OneToMany(() => WoMaterialEntity, (woMaterial) => woMaterial.materialType)
  woMaterials: WoMaterialEntity[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<MaterialTypeEntity> = {}) {
    Object.assign(this, data);
  }
}
