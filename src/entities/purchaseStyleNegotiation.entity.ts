import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Provider } from './provider.entity';
import * as _ from 'lodash';
import { PurchaseStyle } from './purchaseStyle.entity';
import { ExitPort } from './exitPort.entity';
import { Purchase } from './purchase.entity';

@Entity()
export class PurchaseStyleNegotiation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Purchase, purchase => purchase.negotiations, { onDelete: 'CASCADE' })
    purchase: Purchase;

    @Column({ nullable: true })
    styleId: number;

    @ManyToOne(() => Provider)
    provider: Provider;

    @ManyToOne(() => ExitPort)
    exitPort: ExitPort;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    fob: number;

    @Column({ nullable: true })
    comments: string;

    @Column({ default: false })
    selected: boolean;

    @Column({ default: false })
    suggestedVendor: boolean;

    @Column()
    userMerchantId: number;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;
}
