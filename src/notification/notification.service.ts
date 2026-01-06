import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService extends TypeOrmCrudService<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity) repo: Repository<NotificationEntity>,
    // @InjectRepository(NotificationEntity, 'rscs') rscsRepo: Repository<NotificationEntity>,
  ) {
    super(repo);
  }

  //   private getRepository(useDefault: boolean): Repository<AppUserEntity> {
  //     return useDefault ? this.defaultUserRepository : this.appUserRepository;
  //   }

  async create(body, company?: string) {
    let item = await this.repo
      .createQueryBuilder('notification')
      .where({ type: body.type })
      .andWhere({ flow: body.flow })
      .andWhere({ event: body.event })
      .andWhere({ branch: { id: body.branch } })
      .andWhere('notification.company = :company', {
        company: company,
      })
      .getOne();

    if (item) {
      item.recipientList = body.recipientList;
      return this.repo.save(item);
    } else {
      var newItem = new NotificationEntity({
        ...body,
        company: company,
      });
      return this.repo.save(newItem);
    }
  }

  // async update(body) {
  //     var item: NotificationEntity = await this.repo.findOneBy({ id: body.id });

  //     item.recipientList = body.recipientList;
  //     return this.repo.save(item)
  // }

  async getOneItem(
    type: number,
    flow: number,
    event: number,
    branchId: number,
    company?: string,
  ) {
    const result = await this.repo
      .createQueryBuilder('notification')
      .where({ type: type })
      .andWhere({ flow: flow })
      .andWhere({ event: event })
      .andWhere({ branch: { id: branchId } })
      .andWhere('notification.company = :company', {
        company: company,
      })
      .getOne();
    return result;
  }
}
