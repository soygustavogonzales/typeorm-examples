import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { OcJda } from './ocJda.entity';

@Entity()
@Index(['ponumb', 'inumbr'], {unique: true})
export class OcJdaDet {
    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => OcJda, parent => parent.id, {nullable: false, onDelete: 'CASCADE'})
    ocjda?: OcJda;

    @Column({nullable: false})
    ponumb: number;

    @Column('decimal', {nullable: false, precision: 9, scale: 0 })
    inumbr: number;

    @Column('decimal', {nullable: false, precision: 12, scale: 3 })
    pomcst: number;

    @Column('decimal', {nullable: false, precision: 10, scale: 0 })
    pomvat: number;

    @Column('decimal', {nullable: false, precision: 10, scale: 0 })
    pomret: number;

    @Column('decimal', {nullable: false, precision: 7, scale: 0 })
    pomqty: number;

    @Column({nullable: false})
    poscol: number;

    @Column({nullable: false})
    possiz: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
