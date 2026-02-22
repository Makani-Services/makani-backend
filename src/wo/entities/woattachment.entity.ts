import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    Index,
    UpdateDateColumn,
} from 'typeorm';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { WoTagEntity } from './wotag.entity';

@Entity('wo_attachment')
export class WoAttachmentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => WoEntity, (wo) => wo.attachments, {
        onDelete: 'CASCADE',
    })
    @Index()
    wo: WoEntity;

    @Column()
    fileName: string;

    @Column({ nullable: true })
    description: string;

    /**
     * Who uploaded the attachment
     * Nullable for legacy data
     */
    @ManyToOne(() => UserEntity, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    uploadedBy: UserEntity;

    @ManyToOne(() => CustomerUserEntity, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    uploadedByCustomerUser: CustomerUserEntity | null;

    @ManyToMany(() => WoTagEntity, (tag) => tag.attachments)
    @JoinTable({
        name: 'wo_attachment_tag',
        joinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags: WoTagEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    constructor(data: Partial<WoAttachmentEntity> = {}) {
        Object.assign(this, data);
    }
}
