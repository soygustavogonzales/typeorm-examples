import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class Exhibition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    active: boolean;
}