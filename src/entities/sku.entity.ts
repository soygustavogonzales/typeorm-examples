import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { Provider } from './provider.entity';
import { SkuColor } from './skuColor.entity';
import { SkuJdaMbr } from './skuJdaMbr.entity';

@Entity()
@Index(['styleId', 'provider'], {unique: true})
export class Sku {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: false})
    styleId: number;

    @Column({nullable: false})
    code: string;

    @ManyToOne(() => Provider, parent => parent.id, {nullable: false, eager: true})
    provider: Provider;

    @OneToMany(() => SkuColor, child => child.sku, {cascade: true, eager: true})
    skuColor?: SkuColor[];

    @ManyToOne(() => SkuJdaMbr, parent => parent.id, {nullable: false, eager: true, onDelete: 'CASCADE' })
    skuJdaMbr?: SkuJdaMbr;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
