import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyType } from './company-type.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

export enum LeadStatus {
  SEND_PS, // blue
  RECALL, // yellow
  SIGN, // green
  CANCEL, // red
}

export enum CallType {
  FIRST,
  SIGN,
  SEND_PS,
  DONT_CALL,
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Index()
  @Column({ name: 'phone_number', type: 'varchar', length: 64, nullable: true })
  phoneNumber?: string | null;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  site?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: null,
    nullable: true,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: CallType,
    default: null,
    nullable: true,
  })
  callType: CallType;

  @ManyToOne(() => CompanyType, (ct) => ct.leads, {
    eager: true,
    nullable: true,
  })
  companyType?: CompanyType;

  @ManyToOne(() => Workspace, (w) => w.leads, { cascade: true })
  workspace!: Workspace;

  @ManyToOne(() => User, (u) => u.leads, { nullable: true })
  responsible: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
