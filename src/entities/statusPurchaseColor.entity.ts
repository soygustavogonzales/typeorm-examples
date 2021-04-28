import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StatusPurchaseColor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}