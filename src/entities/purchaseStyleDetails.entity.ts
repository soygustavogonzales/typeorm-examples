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

    @ManyToOne(() => SeasonSticker, { nullable: true })
    seasonSticker: SeasonSticker;

    @ManyToOne(() => Size, { nullable: true })
    size: Size;

    @ManyToOne(() => Ratio, { nullable: true })
    ratio: Ratio;

    @ManyToOne(() => Shipmethod, { nullable: true })
    shippingMethod: Shipmethod;

    // Optionals
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

    // Columns generate with approvement

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

    @ManyToOne(() => Rse, { nullable: true })
    rse: Rse;

    @RelationId((purchaseStyle: PurchaseStyleDetails) => purchaseStyle.rse)
    rseId: number;

    @ManyToOne(() => PurchaseStyle, { onDelete: 'CASCADE' })
    purchaseStyle: PurchaseStyle;

    @RelationId((purchaseStyle: PurchaseStyleDetails) => purchaseStyle.purchaseStyle)
    purchaseStyleId: number;

    @ManyToOne(() => Segment, { nullable: true })
    segment: Segment;

    @Column({ nullable: true })
    referencialProvider: string;

    // @ManyToOne(() => Profile, { nullable: true })
    // profile: Profile;

    @ManyToOne(() => Cso, { nullable: true })
    cso: Cso;


    @ManyToOne(() => Provider, { nullable: true })
    provider: Provider;


    @ManyToOne(() => OriginCountry, { nullable: true })
    origin: OriginCountry;

    @ManyToOne(() => Packaging, { nullable: true })
    packingMethod: Packaging;

    @RelationId((purchaseStyle: PurchaseStyleDetails) => purchaseStyle.packingMethod)
    packingMethodId: number;

    @ManyToOne(() => Category, { nullable: true })
    category: Category;

    @ManyToOne(() => ExitPort, { nullable: true })
    exitPort: ExitPort;

    @ManyToOne(() => PurchaseStyleNegotiation, { nullable: true })
    purchaseStyleNegotiation: PurchaseStyleNegotiation;

    // Product Manager

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;

}