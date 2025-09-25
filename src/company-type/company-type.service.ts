import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyType } from '../entities/company-type.entity';

@Injectable()
export class CompanyTypeService {
  constructor(@InjectRepository(CompanyType) private readonly repo: Repository<CompanyType>) {}

  create(data: Partial<CompanyType>) {
    const ct = this.repo.create(data);
    return this.repo.save(ct);
  }

  findAll() {
    return this.repo.find({ withDeleted: false });
  }

  async findOne(id: string) {
    const ct = await this.repo.findOne({ where: { id } });
    if (!ct) throw new NotFoundException('CompanyType not found');
    return ct;
  }

  async update(id: string, data: Partial<CompanyType>) {
    const ct = await this.findOne(id);
    Object.assign(ct, data);
    return this.repo.save(ct);
  }

  async softDelete(id: string) {
    const ct = await this.findOne(id);
    await this.repo.softRemove(ct);
    return { success: true };
  }
}


