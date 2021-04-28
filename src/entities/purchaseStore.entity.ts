import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, ManyToMany, JoinTable } from 'typeorm';
import { Store } from './store.entity';
import { Purchase } from './purchase.entity';
import { PurchaseStyle } from './purchaseStyle.entity';
@Entity()
export class PurchaseStore {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Purchase, purchase => purchase.stores, { onDelete: 'CASCADE' })
    purchase: Purchase;

    @ManyToOne(() => Store)
    store: Store;

    @OneToMany(() => PurchaseStyle, purchaseStyle => purchaseStyle.purchaseStore)
    styles: PurchaseStyle[];

    @Column({default: true})
    active: boolean;
    
    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;
}