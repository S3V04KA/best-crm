import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { CompanyType } from '../entities/company-type.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(CompanyType)
    private readonly companyTypeRepo: Repository<CompanyType>,
  ) {}

  async create(data: Partial<Lead>) {
    const companyType = await this.companyTypeRepo.findOne({
      where: { id: data.companyType?.id },
    });

    if (!companyType) {
      throw new NotFoundException('Company type not found');
    }

    const lead = this.leadRepo.create({ ...data, companyType });
    await this.leadRepo.save(lead);

    return { success: true, id: lead.id };
  }

  findAll() {
    return this.leadRepo.find({ withDeleted: false });
  }

  findAllFromWorkspace(workspaceId: string) {
    return this.leadRepo.find({
      withDeleted: false,
      where: { workspace: { id: workspaceId } },
    });
  }

  findAllMineFromWorkspace(workspaceId: string, userId: string) {
    return this.leadRepo.find({
      withDeleted: false,
      where: { workspace: { id: workspaceId }, responsible: { id: userId } },
    });
  }

  async findOne(id: string) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async findOneWithWorkspace(id: string) {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: { workspace: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, data: Partial<Lead>) {
    const lead = await this.findOne(id);
    Object.assign(lead, data);
    return this.leadRepo.save(lead);
  }

  async softDelete(id: string) {
    const lead = await this.findOne(id);
    await this.leadRepo.softRemove(lead);
    return { success: true };
  }
}
