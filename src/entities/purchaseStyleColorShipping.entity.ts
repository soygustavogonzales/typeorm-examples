import moment = require('moment');
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert } from 'typeorm';
import { PurchaseStyleColor } from './purchaseStyleColor.entity';

@Entity()
export class PurchaseStyleColorShipping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    units: number;

    @Column()
    shipping: string;
    
    @Column({ default: '' })
    piName: string;
    
    @Column({ type: 'timestamptz' })
    date: Date;

    @ManyToOne(() => PurchaseStyleColor , { onDelete: 'CASCADE' })
    purchaseStyleColor: PurchaseStyleColor;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

    @Column({ nullable: true, type: 'timestamptz' })
    arrivalDate: Date;

    getPiDate(){
        return moment(this.date).format('DD/MMM').replace(/\//g, '').toUpperCase();
        // return `${this.date.getDate}${this.date.getMonth()}`
    }

}