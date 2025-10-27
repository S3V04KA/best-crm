import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';

@Entity('user_workspace_overrides')
export class UserWorkspaceOverride {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.workspaceOverrides, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' }) // Явно указываем колонку FK
  user!: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userOverrides, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'workspaceId' }) // Явно указываем колонку FK
  workspace!: Workspace;

  @DeleteDateColumn()
  deletedAt?: Date;
}
