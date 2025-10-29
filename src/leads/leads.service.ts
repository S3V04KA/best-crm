import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { CompanyType } from '../entities/company-type.entity';
import { CsvImportRowDto, CsvImportResponseDto } from './dto/csv-import.dto';

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

    const lead = this.leadRepo.create({
      ...data,
    });
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
      relations: { responsible: true },
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

  /**
   * Parse CSV content and return array of rows
   */
  private parseCsvContent(csvContent: string): CsvImportRowDto[] {
    // First, normalize the CSV content to handle multi-line fields properly
    const normalizedContent = this.normalizeCsvContent(csvContent);
    const lines = normalizedContent.split('\n').filter((line) => line.trim());

    // Find header line (skip empty lines at the beginning)
    let headerLineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.includes('Название компании') &&
        line.includes('Сайт компании')
      ) {
        headerLineIndex = i;
        break;
      }
    }

    if (headerLineIndex >= lines.length - 1) {
      throw new BadRequestException(
        'CSV file must contain header row with required columns',
      );
    }

    // Parse header to get column mapping
    const headerLine = lines[headerLineIndex];
    const header = this.parseCsvLine(headerLine).map((col) =>
      col.trim().toLowerCase(),
    );

    const expectedColumns = [
      'название компании',
      'сайт компании',
      'телефон компании',
      'почта',
    ];

    // Check if all required columns are present
    const missingColumns = expectedColumns.filter(
      (col) => !header.includes(col),
    );
    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns.join(', ')}`,
      );
    }

    const rows: CsvImportRowDto[] = [];

    // Process data rows (skip header)
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseCsvLine(line);

      // Pad with empty strings if we have fewer values than headers
      while (values.length < header.length) {
        values.push('');
      }

      // Truncate if we have more values than headers (ignore extra columns)
      if (values.length > header.length) {
        values.splice(header.length);
      }

      const row: CsvImportRowDto = {
        companyName: '',
        companyWebsite: '',
        companyPhone: '',
        companyEmail: '',
      };

      // Map values to properties based on header
      header.forEach((col, index) => {
        const value = values[index]?.trim() || '';
        switch (col) {
          case 'название компании':
            row.companyName = value;
            break;
          case 'сайт компании':
            row.companyWebsite = value && value !== '-' ? value : undefined;
            break;
          case 'телефон компании':
            row.companyPhone = value && value !== '-' ? value : undefined;
            break;
          case 'почта':
            row.companyEmail = value && value !== '-' ? value : undefined;
            break;
        }
      });

      // Only add row if company name is not empty
      if (row.companyName) {
        rows.push(row);
      }
    }

    return rows;
  }

  /**
   * Normalize CSV content to handle multi-line fields and complex formatting
   */
  private normalizeCsvContent(csvContent: string): string {
    const lines = csvContent.split('\n');
    const normalizedLines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're starting a new field or continuing a multi-line field
      if (!inQuotes && line.trim() === '') {
        // Empty line outside quotes - skip it
        continue;
      }

      // Process the line character by character to track quote state
      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            // Escaped quote
            currentLine += '"';
            j++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            currentLine += char;
          }
        } else {
          currentLine += char;
        }
      }

      // If we're not in quotes, this line is complete
      if (!inQuotes) {
        normalizedLines.push(currentLine);
        currentLine = '';
      } else {
        // We're still in quotes, continue on next line
        currentLine += ' ';
      }
    }

    // Add any remaining content
    if (currentLine.trim()) {
      normalizedLines.push(currentLine);
    }

    return normalizedLines.join('\n');
  }

  /**
   * Parse a single CSV line handling quotes and commas properly
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Import leads from CSV file
   */
  async importFromCsv(
    csvContent: string,
    workspaceId: string,
  ): Promise<CsvImportResponseDto> {
    // Parse CSV content
    let csvRows: CsvImportRowDto[];
    try {
      csvRows = this.parseCsvContent(csvContent);
    } catch (error) {
      throw new BadRequestException(`CSV parsing error: ${error.message}`);
    }

    const result: CsvImportResponseDto = {
      totalRows: csvRows.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdLeadIds: [],
    };

    // Process each row
    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      const rowNumber = i + 2; // +2 because CSV is 1-indexed and we skip header

      try {
        // Validate required fields
        if (!row.companyName || row.companyName.trim() === '') {
          throw new Error('Company name is required');
        }

        // Validate email format if provided
        if (row.companyEmail && !this.isValidEmail(row.companyEmail)) {
          throw new Error('Invalid email format');
        }

        // Create lead
        const leadData: Partial<Lead> = {
          name: row.companyName.trim(),
          site: row.companyWebsite?.trim() || null,
          phoneNumber: row.companyPhone?.trim() || null,
          email: row.companyEmail?.trim() || null,
          workspace: { id: workspaceId } as any,
        };

        const lead = this.leadRepo.create(leadData);
        const savedLead = await this.leadRepo.save(lead);

        result.successCount++;
        result.createdLeadIds.push(savedLead.id);
      } catch (error) {
        result.errorCount++;
        result.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
