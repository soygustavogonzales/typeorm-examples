import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class SeasonCommercial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  jdaCode: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  codeOC: string;

  @Column({ default: true, nullable: true })
  active: boolean;

  @Column({ default: 10, nullable: true })
  unitsEcomConfig: number; // % units Ecommerce By Default

  getPiShortName() {
    return `${this.name[0]}${this.name[this.name.length - 2]}${this.name[this.name.length - 1]}`;
  }
}
