import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OriginCountry } from './originCountry.entity';

@Entity()
export class Provider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    type: string;

    @Column()
    code: string;

    @Column()
    codeJda: string;

    @Column()
    paymentTerm1: string;

    @Column({ nullable: true })
    paymentTerm2: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    email: string;

    @ManyToOne(() => OriginCountry)
    originCountry: OriginCountry;

    @Column({ default: true })
    active: boolean;
}
