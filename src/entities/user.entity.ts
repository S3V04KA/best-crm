import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';
import { UserPermissionOverride } from './user-permission-override.entity';
import { UserWorkspaceOverride } from './workspace-user-override.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: false })
  role!: Role;

  @OneToMany(() => UserPermissionOverride, (upo) => upo.user, { cascade: true })
  permissionOverrides!: UserPermissionOverride[];

  @ManyToMany(() => UserWorkspaceOverride, (uwo) => uwo.user, { cascade: true })
  @JoinTable({
    name: 'user_workspace_overrides',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'workspaceId', referencedColumnName: 'id' },
  })
  workspaceOverrides!: UserWorkspaceOverride[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}


