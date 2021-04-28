import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class SeasonSticker {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    active: boolean;
}
