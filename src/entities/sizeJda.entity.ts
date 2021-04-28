import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class SizeJda {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    shortName: string;

    @Column()
    jdaCode: string;
}
