import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserWorkspaceOverride } from 'src/entities/workspace-user-override.entity';
import { Workspace } from 'src/entities/workspace.entity';
import { In, Repository } from 'typeorm';
import { ResponseFullWorkspaceDto, ResponseWorkspaceDto, UpdatePS } from './dto/workspace.dto';
import { createFile } from 'src/utils/file.helper';

@Injectable()
export class WorkspaceService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Workspace) private readonly workspaceRepo: Repository<Workspace>,
        @InjectRepository(UserWorkspaceOverride) private readonly workspaceOvverideRepo: Repository<UserWorkspaceOverride>,
    ) { }

    listAllWorkspaces(): Promise<ResponseWorkspaceDto[]> {
        return this.workspaceRepo.find();
    }

    // Workspace CRUD
    async createWorkspace(data: Partial<Workspace>): Promise<ResponseFullWorkspaceDto> {
        const workspace = this.workspaceRepo.create(data);
        const savedWorkspace = await this.workspaceRepo.save(workspace);
        return {
            ...savedWorkspace,
            deletedAt: savedWorkspace.deletedAt === null ? undefined : savedWorkspace.deletedAt,
        };
    }
    findWorkspaces() {
        return this.workspaceRepo.find();
    }
    async updateWorkspace(id: string, data: Partial<Workspace>) {
        const workspace = await this.workspaceRepo.findOne({ where: { id } });
        if (!workspace) throw new NotFoundException("Workspace not found");
        Object.assign(workspace, data);
        return { success: true };
    }
    async deleteWorkspace(id: string) {
        const workspace = await this.workspaceRepo.findOne({ where: { id } });
        if (!workspace) throw new NotFoundException("Workspace not found");
        await this.workspaceRepo.softRemove(workspace);
        return { success: true };
    }

    async find(id: string) {
        const workspace = await this.workspaceRepo.findOne({ where: { id } });

        if (!workspace) throw new NotFoundException('Workspace not found');

        return workspace;
    }

    async listCurrntUserWorkspaces(userId: string): Promise<ResponseWorkspaceDto[]> {
        const overrides = await this.workspaceOvverideRepo.find({ where: { user: { id: userId } }, relations: { workspace: true } });

        return overrides.map((w) => ({ id: w.workspace.id, name: w.workspace.name }))
    }

    async addUserToWorkspace(workspaceId: string, userId: string) {
        const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
        if (!workspace) throw new NotFoundException('Workspace not found');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existing = await this.workspaceOvverideRepo.findOne({ where: { user: { id: userId }, workspace: { id: workspaceId } } });
        if (existing) {
            throw new BadRequestException('User already in this workspace');
        }

        await this.workspaceOvverideRepo.save(
            this.workspaceOvverideRepo.create({ user, workspace })
        );

        return { success: true };
    }

    async updatePS(workspaceId: string, data: UpdatePS, file?: any) {
        const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });

        if (!workspace) throw new NotFoundException('Workspace not found');

        if (file) {
            await createFile('./data/PS/', file.originalname, file.buffer);
            workspace.filename = file.originalname;
        }

        workspace.text = data.text ? data.text : undefined;
        workspace.html = data.html ? data.html : undefined;

        await this.workspaceRepo.save(workspace);

        return { success: true };
    }
}
