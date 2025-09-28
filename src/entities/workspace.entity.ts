import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWorkspaceOverride } from './workspace-user-override.entity';
import { Lead } from './lead.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  filename?: string;

  @Column({ type: 'varchar', length: 10000, nullable: true })
  text?: string;

  @Column({ type: 'varchar', length: 50000, nullable: true })
  html?: string;

  @ManyToMany(() => UserWorkspaceOverride, (uwo) => uwo.workspace)
  userOverrides!: UserWorkspaceOverride[];

  @OneToMany(() => Lead, (l) => l.workspace)
  leads!: Lead[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
