import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';

@Entity()
@Index(['field'], {unique: true})
export class SkuErrDictionary {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: false})
    field: string;

    @Column({nullable: false})
    fieldref: string;

    @Column({nullable: false})
    desc: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
