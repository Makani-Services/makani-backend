import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { MaterialTypeEntity } from './material-type.entity';
import { MaterialCategoryEntity } from './material-category.entity';

@Entity('wo_material')
export class WoMaterialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  isAdded: boolean;

  @Column('decimal', { nullable: true })
  quantity: number;

  @ManyToOne(() => WoEntity, (workOrder) => workOrder.materialsUsed, {
    onDelete: 'CASCADE',
  })
  workOrder: WoEntity;

  @ManyToOne(
    () => MaterialTypeEntity,
    (materialType) => materialType.woMaterials,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  materialType: MaterialTypeEntity;

  @ManyToOne(
    () => MaterialCategoryEntity,
    (materialCategory) => materialCategory.woMaterials,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  materialCategory: MaterialCategoryEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  constructor(data: Partial<WoMaterialEntity> = {}) {
    Object.assign(this, data);
  }
}
