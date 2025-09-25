import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('user_permission_overrides')
@Unique(['user', 'permission'])
export class UserPermissionOverride {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.permissionOverrides, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Permission, (permission) => permission.userOverrides, { onDelete: 'CASCADE' })
  permission!: Permission;

  @Column({ type: 'boolean', default: true })
  allowed!: boolean;
}


