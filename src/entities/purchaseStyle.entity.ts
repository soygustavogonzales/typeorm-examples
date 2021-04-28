import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, JoinColumn, OneToOne } from 'typeorm';
import { SeasonCommercial } from './seasonCommercial.entity';
import { Provider } from './provider.entity';
import { OriginCountry } from './originCountry.entity';
import { Packaging } from './packaging.entity';
import { Category } from './category.entity';
import { Segment } from './segment.entity';
import { Rse } from './rse.entity';
import { PurchaseStore } from './purchaseStore.entity';
import { PurchaseStyleColor } from './purchaseStyleColor.entity';
import { PurchaseStyleDetails } from './purchaseStyleDetails.entity';
import * as _ from 'lodash';
import { StatusPurchaseColor } from './statusPurchaseColor.entity';
import { PurchaseStyleNegotiation } from './purchaseStyleNegotiation.entity';

@Entity()
export class PurchaseStyle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    styleId: number;

    @ManyToOne(() => PurchaseStore, purchaseStore => purchaseStore.styles, { onDelete: 'CASCADE' })
    purchaseStore: PurchaseStore;

    @OneToMany(() => PurchaseStyleColor, purchaseStyleColor => purchaseStyleColor.purchaseStyle)
    colors: PurchaseStyleColor[];

    @OneToMany(() => PurchaseStyleDetails, purchaseStyleDetails => purchaseStyleDetails.purchaseStyle)
    details: PurchaseStyleDetails[];

    @ManyToOne(() => StatusPurchaseColor)
    status: StatusPurchaseColor;

    getTotalUnits() {
        if (this.colors.filter(c => c.shippings.length > 0).length > 0) {
            return _.flatten(this.colors.filter(c => c.shippings.length > 0).map(c => c.shippings.map(sh => sh.units))).reduce((a, b) => a + b);
        }
        return 0;
    }
    @Column({ default: true })
    active: boolean;
    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

}