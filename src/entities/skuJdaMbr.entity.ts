import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { Sku } from './sku.entity';

@Entity()
@Index(['jdaMember'], {unique: true})
export class SkuJdaMbr {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: false})
    jdaMember: string;

    @OneToMany(() => Sku, child => child.skuJdaMbr, { cascade: true })
    sku?: Sku[];

    @Column({default: -1})
    userId: number;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
