import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SeasonCommercial } from './seasonCommercial.entity';
@Entity()
export class EcomUnitsConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profileId: number;

  @Column()
  brandId: number;

  @Column()
  classTypeId: number;

  @Column({default: 10})
  percentage: number;

  @ManyToOne(() => SeasonCommercial)
  @JoinColumn([{ name: 'seasonCommercialId', referencedColumnName: 'id' }])
  seasonCommercial: SeasonCommercial;

}
