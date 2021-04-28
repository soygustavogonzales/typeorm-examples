import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { OriginCountry } from './originCountry.entity';
import { Shipmethod } from './shipmethod.entity';
import { DestinyCountry } from './destinyCountry.entity';


@Entity()
export class ImportFactor {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => OriginCountry)
    originCountry: OriginCountry;

    @ManyToOne(() => DestinyCountry)
    destinyCountry: DestinyCountry;

    @ManyToOne(() => Shipmethod)
    shipmethod: Shipmethod;

    @Column()
    departmentId: number;

    @Column({ type: 'decimal', precision: 3, scale: 2 })
    factor: number;

    @Column()
    active: boolean;
}