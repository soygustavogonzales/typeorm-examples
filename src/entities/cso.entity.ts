import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    active: boolean;
}
