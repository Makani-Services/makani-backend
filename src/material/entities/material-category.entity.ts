import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialTypeEntity } from './material-type.entity';
import { WoMaterialEntity } from './wo-material.entity';

@Entity('material_category')
export class MaterialCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ length: 50 })
  unit: string;

  @Column()
  isMandatory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  company: string;

  @OneToMany(() => MaterialTypeEntity, (materialType) => materialType.category)
  materialTypes: MaterialTypeEntity[];

  @OneToMany(
    () => WoMaterialEntity,
    (woMaterial) => woMaterial.materialCategory,
  )
  woMaterials: WoMaterialEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<MaterialCategoryEntity> = {}) {
    Object.assign(this, data);
  }
}
