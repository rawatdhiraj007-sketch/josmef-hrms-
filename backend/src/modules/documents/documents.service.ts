import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document201 } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document201)
    private readonly repo: Repository<Document201>,
  ) {}

  async create(dto: CreateDocumentDto, userId: string): Promise<Document201> {
    const doc = this.repo.create({ ...dto, createdBy: userId });
    return this.repo.save(doc);
  }

  async findByEmployee(employeeId: string, category?: string) {
    const qb = this.repo.createQueryBuilder('d')
      .where('d.employeeId = :eid AND d.deleted_at IS NULL', { eid: employeeId });

    if (category) qb.andWhere('d.category = :cat', { cat: category });

    qb.orderBy('d.created_at', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Document201> {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string): Promise<Document201> {
    const doc = await this.findOne(id);
    Object.assign(doc, dto, { updatedBy: userId });
    return this.repo.save(doc);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findOne(id);
    await this.repo.softRemove(doc);
  }
}
