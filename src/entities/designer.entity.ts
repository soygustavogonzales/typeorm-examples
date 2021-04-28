import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Designer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;
}
