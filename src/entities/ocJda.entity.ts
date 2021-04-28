import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { OcJdaDet } from './ocJdaDet.entity';
import { Provider } from './provider.entity';

@Entity()
@Index(['piname', 'ponumb'], {unique: true})
export class OcJda {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: false})
    piname: string;

    @ManyToOne(() => Provider, parent => parent.id, {nullable: false, eager: true})
    provider: Provider;

    @Column({nullable: false})
    ponot1: string;

    @Column({nullable: false})
    ponumb: number;

    @Column({nullable: false})
    povnum: number;

    @Column({nullable: false})
    podest: string;

    @Column({nullable: false})
    postor: number;

    @Column({nullable: false})
    podpt: number;

    @Column({nullable: false})
    poedat: number;

    @OneToMany(() => OcJdaDet, child => child.ocjda, {cascade: true, eager: true})
    ocdet?: OcJdaDet[];

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
