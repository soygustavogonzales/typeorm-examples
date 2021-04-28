import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ratio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ratio: string;
}
