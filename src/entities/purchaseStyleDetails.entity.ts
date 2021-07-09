import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, RelationId, OneToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { OriginCountry } from './originCountry.entity';
import { Packaging } from './packaging.entity';
import { Category } from './category.entity';
import { Segment } from './segment.entity';
import { Rse } from './rse.entity';
import { PurchaseStyle } from './purchaseStyle.entity';
import { Shipmethod } from './shipmethod.entity';
import { Size } from './size.entity';
import { Ratio } from './ratio.entity';
import { SeasonSticker } from './seasonSticker.entity';
import { Cso } from './cso.entity';
import { ExitPort } from './exitPort.entity';
import { PurchaseStyleNegotiation } from './purchaseStyleNegotiation.entity';
import { SustainableFeature } from './sustainableFeature.entity';
import { Certifications } from './certifications.entity';
import { Exhibition } from './exhibition.entity';
@Entity()
export class PurchaseStyleDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, default: false })
    atc: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    fob: number;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    fobReferencial: number;

    @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
    price: number;

    @Column({ nullable: true, default: false })
    hanger: boolean;

    @Column({ nullable: true, default: false })
    vstTag: boolean;

    @Column({ nullable: true })
    merchandiser: string;

    @Column({ nullable: true })
    productManager: string;

    @Column({ nullable: true })
    brandManager: string;

    @Column({ nullable: true })
    designer: string;

    @Column({ nullable: true })
    negotiatior: string;

    @Column({ nullable: true, default: false })
    techFile: boolean;

    @Column({ nullable: true, default: false })
    sizeSpec: boolean;

    @Column({ nullable: true })
    internetDescription: string;

    @Column({ nullable: true })
    gauge: string;

    @Column({ nullable: true })
    seasonStickerId: number;
    @ManyToOne(() => SeasonSticker, { nullable: true })
    seasonSticker: SeasonSticker;

    @Column({ nullable: true })
    sizeId: number;
    @ManyToOne(() => Size, { nullable: true })
    size: Size;

    @Column({ nullable: true })
    ratioId: number;
    @ManyToOne(() => Ratio, { nullable: true })
    ratio: Ratio;

    @Column({ nullable: true })
    shippingMethodId: number;
    @ManyToOne(() => Shipmethod, { nullable: true })
    shippingMethod: Shipmethod;

    @Column({ nullable: true })
    collection: string;

    @Column({ nullable: true })
    event: string;

    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
    target: number;

    @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
    sato: number;

    @Column({ nullable: true })
    additionalAccesory: string;

    @Column({ nullable: true })
    composition: string;

    @Column({ nullable: true })
    fabricWight: string;

    @Column({ nullable: true })
    fabricConstruction: string;

    @Column({ nullable: true })
    fabricWeaving: string;

    @Column({ type: 'decimal', nullable: true })
    dollarChange: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    importFactor: number;

    @Column({ type: 'decimal', scale: 2, nullable: true })
    cost: number;

    @Column({ type: 'decimal', scale: 2, nullable: true })
    imu: number;

    @RelationId((purchaseStyle: PurchaseStyleDetails) => purchaseStyle.rse)
    rseId: number;
    @ManyToOne(() => Rse, { nullable: true })
    rse: Rse;

    @Column({ nullable: true })
    sustainableFeatureId: number;
    @ManyToOne(() => SustainableFeature, { nullable: true })
    sustainableFeature: SustainableFeature;

    @Column({ nullable: true })
    certificationsId: number;
    @ManyToOne(() => Certifications, { nullable: true })
    certifications: Certifications;

    @RelationId((purchaseStyle: PurchaseStyleDetails) => purchaseStyle.purchaseStyle)
    purchaseStyleId: number;
    @ManyToOne(() => PurchaseStyle, { onDelete: 'CASCADE' })
    purchaseStyle: PurchaseStyle;

    @Column({ nullable: true })
    segmentId: number;
    @ManyToOne(() => Segment, { nullable: true })
    segment: Segment;

    @Column({ nullable: true })
    referencialProvider: string;

    @Column({ nullable: true })
    csoId: number;
    @ManyToOne(() => Cso, { nullable: true })
    cso: Cso;
    
    @Column({ nullable: true })
    providerId: number;
    @ManyToOne(() => Provider, { nullable: true })
    provider: Provider;

    @Column({ nullable: true })
    originId: number;
    @ManyToOne(() => OriginCountry, { nullable: true })
    origin: OriginCountry;

    @Column({ nullable: true })
    packingMethodId: number;
    @ManyToOne(() => Packaging, { nullable: true })
    packingMethod: Packaging;

    @Column({ nullable: true })
    exhibitionId: number;
    @ManyToOne(() => Exhibition, { nullable: true })
    exhibition: Exhibition;

    @Column({ nullable: true })
    categoryId: number;
    @ManyToOne(() => Category, { nullable: true })
    category: Category;

    @Column({ nullable: true })
    exitPortId: number;
    @ManyToOne(() => ExitPort, { nullable: true })
    exitPort: ExitPort;

    @ManyToOne(() => PurchaseStyleNegotiation, { nullable: true })
    purchaseStyleNegotiation: PurchaseStyleNegotiation;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;
}
