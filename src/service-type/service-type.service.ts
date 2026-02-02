import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ServiceTypeEntity } from './entities/service-type.entity';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { SERVICE_TYPE_BACKGROUND_COLORS } from './constants/service-type-colors';

@Injectable()
export class ServiceTypeService extends TypeOrmCrudService<ServiceTypeEntity> {
  constructor(
    @InjectRepository(ServiceTypeEntity) repo: Repository<ServiceTypeEntity>,
  ) {
    super(repo);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async save(data: CreateServiceTypeDto): Promise<ServiceTypeEntity> {
    const existingCount = await this.repo.count();
    const colorIndex =
      existingCount % SERVICE_TYPE_BACKGROUND_COLORS.length;
    const backgroundColor =
      SERVICE_TYPE_BACKGROUND_COLORS[colorIndex];

    const newServiceType = new ServiceTypeEntity({
      ...data,
      backgroundColor,
    });
    console.log("🚀 ~ ServiceTypeService ~ save ~ newServiceType:", newServiceType)
    return await this.repo.save(newServiceType);
  }

  async update(data: UpdateServiceTypeDto): Promise<ServiceTypeEntity> {
    const updatedServiceType = new ServiceTypeEntity(data);
    return await this.repo.save(updatedServiceType);
  }

  async archive(serviceTypeId: number): Promise<boolean> {
    const { affected } = await this.repo.update(serviceTypeId, { isArchived: true });
    if (affected && affected > 0) {
      return true;
    } else {
      throw new NotFoundException('Service type not found');
    }
  }
}
