import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OriginCountry } from './originCountry.entity';
import { SeasonCommercial } from './seasonCommercial.entity';

@Entity()
@Index(['divisionId', 'seasonCommercialId', 'originCountryId'], {unique: true})
export class ShippingDatesChild {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Id Division',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumberString()
    @Column({nullable: false})
    divisionId: number;

    @ApiProperty({
        description: 'Id Temporada comercial',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumberString()
    @ManyToOne(() => SeasonCommercial, parent => parent.id, {nullable: false, eager: true})
    seasonCommercialId: SeasonCommercial;

    @ApiProperty({
        description: 'Id Pais de origen',
        example: 1,
    })
    @IsNotEmpty()
    @ManyToOne(() => OriginCountry, parent => parent.id, {nullable: false, eager: true})
    originCountryId: OriginCountry;

    @ApiProperty({
        description: 'Cantidad de dias en relación a CHINA',
        example: 1,
    })
    @IsNotEmpty()
    @Column()
    days: number;

    @CreateDateColumn({ select : false })
    public createdAt: Date;

    @UpdateDateColumn({ select : false })
    public updatedAt: Date;
}
