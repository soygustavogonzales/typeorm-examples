import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { Size } from './size.entity';
import { SkuColor } from './skuColor.entity';
import { SizeJda } from './sizeJda.entity';

@Entity()
@Index(['skuColor', 'sizeJda'], {unique: true})
export class SkuColorSize {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => SkuColor, parent => parent.id, {nullable: false, onDelete: 'CASCADE'})
    skuColor?: SkuColor;

    @ManyToOne(() => SizeJda, parent => parent.id, {nullable: false, eager: true})
    sizeJda: SizeJda;

    @ManyToOne(() => Size, parent => parent.id, {nullable: false, eager: true})
    size: Size;

    @Column({ nullable: true })
    sku?: string;

    @Column({ nullable: true })
    ean?: string;

    @Column({ nullable: true })
    atc?: string;

    @Column({ nullable: true })
    datejda?: string;

    @Column({ nullable: false })
    ratio: number;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
