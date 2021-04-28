import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Size {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string;

    @Column({nullable: true})
    active: boolean;

    @Column()
    code: string;
}
