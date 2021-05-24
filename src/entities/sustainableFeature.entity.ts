import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class SustainableFeature {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    active: boolean;
}