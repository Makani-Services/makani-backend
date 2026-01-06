import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CreatePoItemDto } from './dto/create-poitem.dto';
import { UpdatePoItemDto } from './dto/update-poitem.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { PoItemEntity } from './entities/poitem.entity';
import { PoEntity } from 'src/po/entities/po.entity';

@Injectable()
export class PoItemService extends TypeOrmCrudService<PoItemEntity> {
  constructor(
    @InjectRepository(PoItemEntity) repo: Repository<PoItemEntity>,
    @InjectRepository(PoEntity) private poRepo: Repository<PoEntity>,
  ) {
    super(repo);
  }

  async create(createWoDto: CreatePoItemDto) {
    var newWO = new PoItemEntity(createWoDto);
    return await this.repo.save(newWO);
  }

  async createMultipleItems(data, company) {
    // const uploadFolderPath = path.join(
    //   __dirname,
    //   '..',
    //   '..',
    //   'public/uploads/',
    // );

    let poItemArray = new Array<PoItemEntity>();

    for (let item of data) {
      const newPoItem = new PoItemEntity();
      newPoItem.description = item.description;
      newPoItem.number = String(Date.now());

      if (item.base64) {
        const fileName = item.name.split('.')[0];
        const extension = item.name.split('.')[1];
        const newFileName =
          fileName + '-' + String(Date.now()) + '.' + extension;
        const filePath = `public/${company}/uploads/${newFileName}`;

        const buffer = Buffer.from(item.base64, 'base64');
        try {
          await fs.promises.writeFile(filePath, buffer);
        } catch (err) {
          console.log('err: ', err);
        }

        newPoItem.attachment = newFileName;
      }
      let res = await this.repo.save(newPoItem);
      poItemArray.push(res);
    }

    return poItemArray;
  }

  // async createMultipleItems(data) {
  //   const uploadFolderPath = path.join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'public/uploads/',
  //   );

  //   let poItemArray = new Array<PoItemEntity>();

  //   for (let item of data) {
  //     const fileName = String(Date.now()) + '.jpg';
  //     const filePath = path.join(uploadFolderPath, fileName);
  //     console.log(filePath);

  //     const buffer = Buffer.from(item.base64, 'base64');
  //     await fs.promises.writeFile(filePath, buffer);

  //     const newPoItem = new PoItemEntity(item);
  //     newPoItem.number = String(Date.now());
  //     let res = await this.repo.save(newPoItem);
  //     poItemArray.push(res);
  //   }

  //   return poItemArray;
  // }

  // async findPOItems() {
  //   return await this.repo.find({
  //     relations: [
  //       'requestedUser',
  //       'customer',
  //       'assignedTechs',
  //       'assignedTechs.user',
  //     ],
  //   });
  // }

  async update(id: number, data: UpdatePoItemDto) {
    let wo = await this.repo.findOne({
      where: { id: id },
      relations: [
        'requestedUser',
        'customer',
        'assignedTechs',
        'assignedTechs.user',
      ],
    });
    Object.assign(wo, data);
    // wo = data;
    return await this.repo.save(wo);
  }

  async uploadFile(fileNames: string, id: number): Promise<PoItemEntity> {
    const poItem = await this.repo.findOne({
      where: { id: id },
      // relations: ['requestedUser', 'customer'],
    });

    poItem.attachment = fileNames;

    return await this.repo.save(poItem);
  }
}
