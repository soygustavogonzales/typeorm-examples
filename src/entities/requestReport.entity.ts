import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class RequestReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reportType: number;

    @Column()
    subscriptionId: string;

    @Column()
    userId: number;

    @Column()
    url: string;

    @Column()
    status: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    notificationData: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    createDate: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'LOCALTIMESTAMP' })
    updateDate: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deleteDate: Date;
}
