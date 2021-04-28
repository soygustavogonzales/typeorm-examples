import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, RelationId } from 'typeorm';
import { DestinyCountry } from './destinyCountry.entity';
import { Purchase } from './purchase.entity';
@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    shortName: string;

    @Column({ default: '' })
    localCode: string;

    @Column({ default: '' })
    ocCode: string;

    @Column()
    priority: number;

    @Column({nullable: true})
    impnumpfx: string;

    @ManyToOne(() => DestinyCountry)
    destinyCountry: DestinyCountry;

    @RelationId((store: Store) => store.destinyCountry)
    destinyCountryId: number;

}