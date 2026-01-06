import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { VendorEntity } from 'src/vendor/entities/vendor.entity';
import { Repository } from 'typeorm';
import { KeywordEntity } from './entities/keyword.entity';

@Injectable()
export class KeywordService extends TypeOrmCrudService<KeywordEntity> {
  constructor(
    @InjectRepository(KeywordEntity) repo: Repository<KeywordEntity>,
  ) {
    super(repo);
  }

  async findAll(userId, count) {
    // let keywords = await this.repo
    //   .createQueryBuilder('keyword')
    //   .where('keyword.userId = :userId', { userId })
    //   .distinctOn(['keyword.keyword'])
    //   .orderBy('keyword.keyword', 'ASC')
    //   // .addOrderBy('keyword.createdAt', 'DESC')
    //   .limit(count)
    //   .getMany();

    // return keywords.sort(
    //   (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    // );

    // const uniqueKeywords = await this.repo
    //   .createQueryBuilder('keyword')
    //   .select('DISTINCT keyword.keyword', 'keyword') // Use DISTINCT to fetch unique values
    //   .getRawMany();

    // return uniqueKeywords.map((item) => item.keyword); // Extract only the keyword values

    const uniqueKeywords = await this.repo
      .createQueryBuilder('keyword')
      .leftJoinAndSelect('keyword.user', 'user')
      .select('keyword.keyword', 'keyword')
      .addSelect('MAX(keyword.createdAt)', 'createdAt')
      .where('user.id = :userId', { userId })
      .groupBy('keyword.keyword')
      .orderBy('MAX(keyword.createdAt)', 'DESC')
      .take(count)
      .getRawMany();

    uniqueKeywords.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    let keywords = uniqueKeywords.map((item) => item.keyword);

    return keywords;
  }

  async save(userId, keyword) {
    return await this.repo.save({ user: { id: userId }, keyword });
  }
}
