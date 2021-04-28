import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { Sku } from './sku.entity';
import { SkuColorSize } from './skuColorSize.entity';

@Entity()
@Index(['sku', 'styleColorId'], {unique: true})
export class SkuColor {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => Sku, parent => parent.id, {nullable: false, onDelete: 'CASCADE'})
    sku?: Sku;

    @Column({nullable: false})
    styleColorId: number;

    @Column({nullable: false})
    shortName: string;

    @Column({nullable: false})
    colorCode: number;

    @OneToMany(() => SkuColorSize, child => child.skuColor, {cascade: true, eager: true})
    skuColorSize?: SkuColorSize[];

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
