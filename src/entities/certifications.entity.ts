import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { SustainableFeature } from './sustainableFeature.entity';

@Entity()
export class Certifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    sustainableFeatureId: number;

    @ManyToOne(() => SustainableFeature, { nullable: true })
    sustainableFeature: SustainableFeature;
} 