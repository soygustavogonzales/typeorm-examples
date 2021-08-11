import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { OcJdaDet } from './ocJdaDet.entity';
import { OcJdaMbr } from './ocJdaMbr.entity';
import { Provider } from './provider.entity';

@Entity()
@Index(['piname', 'ponumb'], {unique: true})
export class OcJda {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({nullable: true})
    piname: string;

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
    
    @Column({type: 'real', nullable: true})
    pocost: number;
    
    @Column({nullable: false, default: 'I'})
    potpid: string;

    @OneToMany(() => OcJdaDet, child => child.ocjda, {cascade: true, eager: true})
    ocdet?: OcJdaDet[];

    @Column({ nullable: true })
    providerId: number;
    @ManyToOne(() => Provider, parent => parent.id, {nullable: true})
    provider: Provider;

    @Column({ nullable: true })
    ocJdaMbrId: number;
    @ManyToOne(() => OcJdaMbr, parent => parent.id, {nullable: true, eager: true })
    ocJdaMbr?: OcJdaMbr;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate?: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate?: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate?: Date;
}
