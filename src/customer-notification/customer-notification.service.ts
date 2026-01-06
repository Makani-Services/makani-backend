import { Injectable } from '@nestjs/common';
import { CreateCustomerNotificationDto } from './dto/create-customer-notification.dto';
import { CustomerNotificationEntity } from './entities/customer-notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomerNotificationService {
  constructor(
    @InjectRepository(CustomerNotificationEntity)
    private readonly customerNotificationRepository: Repository<CustomerNotificationEntity>,
  ) {}

  create(createCustomerNotificationDto: CreateCustomerNotificationDto) {
    const customerNotification = this.customerNotificationRepository.create(
      createCustomerNotificationDto,
    );
    return this.customerNotificationRepository.save(customerNotification);
  }

  findAll() {
    return this.customerNotificationRepository.find();
  }

  findOne(status: number, type: number, locationId: number, company: string) {
    return this.customerNotificationRepository.findOne({
      relations: ['customerLocation'],
      where: { status, type, company, customerLocation: { id: locationId } },
    });
  }

  async update(updateCustomerNotificationDto: any) {
    const notification = await this.customerNotificationRepository.findOne({
      relations: ['customerLocation'],
      where: {
        status: updateCustomerNotificationDto.status,
        type: updateCustomerNotificationDto.type,
        company: updateCustomerNotificationDto.company,
        customerLocation: { id: updateCustomerNotificationDto.locationId },
      },
    });
    if (notification) {
      return this.customerNotificationRepository.update(notification.id, {
        recipientList: updateCustomerNotificationDto.recipientList,
      });
    }
  }

  async remove(
    status: number,
    type: number,
    locationId: number,
    company: string,
  ) {
    // First find the notification to delete
    const notification = await this.customerNotificationRepository.findOne({
      relations: ['customerLocation'],
      where: { status, type, company, customerLocation: { id: locationId } },
    });

    if (notification) {
      return this.customerNotificationRepository.delete(notification.id);
    }

    return { affected: 0 };
  }
}
