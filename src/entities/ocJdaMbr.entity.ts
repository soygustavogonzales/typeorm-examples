import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { OcJda } from './ocJda.entity';

@Entity()
@Index(['jdaMember'], {unique: true})
export class OcJdaMbr {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: false})
    jdaMember: string;

    @OneToMany(() => OcJda, child => child.ocJdaMbr)
    ocJda?: OcJda[];

    @Column({default: -1})
    userId: number;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
