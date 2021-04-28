import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExitPort {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    country: string;

    @Column()
    jdaCode: string;

    @Column({ default: true })
    active: boolean;
}
