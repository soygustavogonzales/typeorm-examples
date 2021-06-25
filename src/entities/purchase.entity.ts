import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { SeasonCommercial } from './seasonCommercial.entity';
import { Status } from './status.entity';
import { PurchaseStore } from './purchaseStore.entity';
import { PurchaseStyleNegotiation } from './purchaseStyleNegotiation.entity';

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('integer', { name: 'brands', array: true })
    brands: number[];

    @Column('integer', { name: 'departments', array: true })
    departments: number[];

    @Column('integer', { name: 'seasonProducts', array: true })
    seasonProducts: number[];

    @Column()
    userId: number;

    @Column({ type: 'timestamp' })
    tripDate: Date;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

    @Column({ type: 'timestamptz', nullable: true })
    approvalDate: Date;

    @ManyToOne(() => SeasonCommercial)
    @JoinColumn([{ name: 'seasonCommercialId', referencedColumnName: 'id' }])
    seasonCommercial: SeasonCommercial;

    @ManyToOne(() => Status)
    status: Status;

    @RelationId((purchase: Purchase) => purchase.seasonCommercial)
    seasonCommercialId: number;

    @OneToMany(() => PurchaseStore, purchaseStore => purchaseStore.purchase)
    stores: PurchaseStore[];

    @OneToMany(() => PurchaseStyleNegotiation, negotiations => negotiations.purchase)
    negotiations: PurchaseStyleNegotiation[];

    // @ManyToMany(() => Store, { cascade: true })
    // @JoinTable({
    //     name: 'purchase_store',
    //     joinColumn: { name: 'purchaseId', referencedColumnName: 'id' },
    //     inverseJoinColumn: { name: 'storeId', referencedColumnName: 'id' },
    // })
    // stores: Store[];
}