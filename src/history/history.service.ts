import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoryEntity } from './entities/history.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

const ITEMS_PER_PAGE = 13;

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

  async getAllByWoIdPaginated(woID: number, pageNumber = 0) {
    const page = Number(pageNumber);
    const safePage = Number.isNaN(page) || page < 0 ? 0 : page;

    const baseQuery = this.repo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .leftJoin('history.wo', 'wo')
      .where('wo.id = :woID', { woID })
      .orderBy('history.createdAt', 'DESC');

    const totalCount = await baseQuery.getCount();
    const history = await baseQuery
      .skip(ITEMS_PER_PAGE * safePage)
      .take(ITEMS_PER_PAGE)
      .getMany();

    return { history, totalCount };
  }
}
