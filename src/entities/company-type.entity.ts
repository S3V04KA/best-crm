import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Lead } from './lead.entity';

@Entity('company_types')
@Unique(['code'])
export class CompanyType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  code!: string; // editable enum-like

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @OneToMany(() => Lead, (lead) => lead.companyType)
  leads!: Lead[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}


