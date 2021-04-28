import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, JoinColumn } from 'typeorm';
import { PurchaseStyle } from './purchaseStyle.entity';
import { PurchaseStyleColorShipping } from './purchaseStyleColorShipping.entity';
import { Status } from './status.entity';
import { StatusPurchaseColor } from './statusPurchaseColor.entity';

@Entity()
export class PurchaseStyleColor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    styleColorId: number;

    @Column()
    state: boolean;

    @Column({ default: false })
    approved: boolean;

    @ManyToOne(() => StatusPurchaseColor, { nullable: false  })
    status: StatusPurchaseColor;

    @Column({ default: '' })
    piName: string;

    @ManyToOne(() => PurchaseStyle, purchaseStyle => purchaseStyle.colors, { onDelete: 'CASCADE' })
    @JoinColumn([{ name: 'purchaseStyleId', referencedColumnName: 'id' }])
    purchaseStyle: PurchaseStyle;

    @OneToMany(() => PurchaseStyleColorShipping, purchaseStyleColorShipping => purchaseStyleColorShipping.purchaseStyleColor)
    shippings: PurchaseStyleColorShipping[];

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

    getTotalUnits() {
        if (this.shippings.length > 0) {
            return this.shippings.map(sh => sh.units).reduce((a, b) => a + b);

        }
        return 0;
    }

}