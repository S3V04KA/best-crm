import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { UserPermissionOverride } from './user-permission-override.entity';

@Entity('permissions')
@Unique(['code'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  code!: string; // e.g., 'lead.create', 'lead.update'

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions!: RolePermission[];

  @OneToMany(() => UserPermissionOverride, (upo) => upo.permission)
  userOverrides!: UserPermissionOverride[];
}


