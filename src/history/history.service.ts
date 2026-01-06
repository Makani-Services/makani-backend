import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoryEntity } from './entities/history.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HistoryService extends TypeOrmCrudService<HistoryEntity> {
  constructor(
    @InjectRepository(HistoryEntity) repo: Repository<HistoryEntity>,
  ) {
    super(repo);
  }

  async create(createHistoryDto) {
    return await this.repo.save(createHistoryDto);
  }

  async getAllByWoId(woID: number) {
    return await this.repo.find({
      where: { wo: { id: woID } },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
