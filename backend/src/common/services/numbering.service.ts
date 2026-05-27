import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Counter } from '../entities/counter.entity';

@Injectable()
export class NumberingService {
  constructor(
    @InjectRepository(Counter)
    private readonly counterRepo: Repository<Counter>,
  ) {}

  /**
   * Generates the next sequential number for a given prefix.
   * Format: PREFIX-YYYY-NNN (e.g. APP-2025-001)
   */
  async next(prefix: string): Promise<string> {
    const year = new Date().getFullYear();
    const key = `${prefix}-${year}`;

    let counter = await this.counterRepo.findOne({ where: { key } });
    if (!counter) {
      counter = this.counterRepo.create({ key, lastValue: 0 });
    }
    counter.lastValue += 1;
    await this.counterRepo.save(counter);

    const seq = String(counter.lastValue).padStart(3, '0');
    return `${prefix}-${year}-${seq}`;
  }

  /**
   * Preview the next number without incrementing
   */
  async peek(prefix: string): Promise<string> {
    const year = new Date().getFullYear();
    const key = `${prefix}-${year}`;

    const counter = await this.counterRepo.findOne({ where: { key } });
    const nextVal = (counter?.lastValue ?? 0) + 1;
    return `${prefix}-${year}-${String(nextVal).padStart(3, '0')}`;
  }
}
