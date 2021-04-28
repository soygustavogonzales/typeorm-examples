import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { SeasonCommercial } from './seasonCommercial.entity';
import { OriginCountry } from './originCountry.entity';
import { IsEnum, IsNotEmpty, IsNumber, IsAlphanumeric, IsDate, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Type} from 'class-transformer';

@Entity()
@Index(['divisionId', 'seasonCommercialId', 'originCountryId', 'shipping'], {unique: true})
export class ShippingDates {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Id Division',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Column({nullable: false})
    divisionId: number;

    @ApiProperty({
        description: 'Id Temporada comercial',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(() => SeasonCommercial, parent => parent.id, {nullable: false, eager: true})
    seasonCommercialId: SeasonCommercial;

    @ApiProperty({
        description: 'Id Pais de origen',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(() => OriginCountry, parent => parent.id, {nullable: false, eager: true})
    originCountryId: OriginCountry;

    @ApiProperty({
        description: 'Envio E1,E2....E6',
        example: 'E1',
    })
    @IsNotEmpty()
    @IsAlphanumeric()
    @IsEnum({sd1 : 'E1', sd2 : 'E2', sd3 : 'E3', sd4 : 'E4', sd5 : 'E5', sd6 : 'E6'})
    @Column({nullable: false})
    shipping: string;

    @ApiProperty({
        description: 'Fecha envío YYYY-MM-DD',
        example: '2020-04-29',
    })
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    @Column({nullable: false})
    date: Date;

    @CreateDateColumn({ select : false })
    public createdAt: Date;

    @UpdateDateColumn({ select : false })
    public updatedAt: Date;
}
