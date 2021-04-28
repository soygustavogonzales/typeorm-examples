import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Packaging {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    jdaCode: string;

    @Column({ default: true })
    active: boolean;
}
