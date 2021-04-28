import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { DestinyCountry } from './destinyCountry.entity';
import { SeasonCommercial } from './seasonCommercial.entity';

@Entity()
export class DollarChange {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DestinyCountry)
    destinyCountry: DestinyCountry;

    @ManyToOne(() => SeasonCommercial)
    seasonCommercial: SeasonCommercial;

    @Column({ type: 'decimal' })
    value: number;

    @Column()
    active: boolean;


    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

}
