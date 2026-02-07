import { Injectable } from '@nestjs/common';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';
import { CustomerNoteEntity } from './entities/customer-note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerNotificationService } from 'src/customer-notification/customer-notification.service';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { UserService } from 'src/user/user.service';
import { getAssignedTechsNameArray } from 'src/core/common/common';
import { default as config } from '../config';
import { EmailService } from 'src/email/email.service';
import { PusherService } from 'src/pusher/pusher.service';
import { CustomerUserService } from 'src/customer-user/customer-user.service';

@Injectable()
export class CustomerNoteService {
  constructor(
    @InjectRepository(CustomerNoteEntity)
    private readonly customerNoteRepository: Repository<CustomerNoteEntity>,
    private readonly customerNotificationService: CustomerNotificationService,
    private readonly customerUserService: CustomerUserService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly pusherService: PusherService,
    @InjectRepository(WoEntity)
    private readonly woRepository: Repository<WoEntity>,
  ) { }

  async create(createCustomerNoteDto: any) {
    let wo = await this.woRepository.findOne({
      where: { id: createCustomerNoteDto.wo.id },
      relations: [
        'customerLocation',
        'customer',
        'assignedTechs',
        'assignedTechs.user',
      ],
    });
    //send email notification to customer users when new customer note is added
    if (createCustomerNoteDto.senderType === 0) {
      try {
        let item = await this.customerNotificationService.findOne(
          3,
          0,
          wo.customerLocation.id,
          wo.company,
        );
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          const mailOptions = {
            from: config.mail.supportEmail,
            to: recipientEmailArray, // list of receivers (separated by ,)
            subject: 'New Note',
            text: 'New Note',
            html:
              `WO#: ${wo.number ? wo.number : 'N/A'}` +
              '<br/>' +
              `New Note: ${createCustomerNoteDto.message}` +
              '<br/>' +
              `Sender: ${createCustomerNoteDto.sender.name}`,
          };
          this.emailService.sendEmail(mailOptions);
        }
      } catch (e) {
        console.log(e);
      }
      //send push notification to customer users when new customer note is added
      try {
        let item = await this.customerNotificationService.findOne(
          3,
          1,
          wo.customerLocation.id,
          wo.company,
        );
        if (item) {
          let recipientEmailArray =
            await this.customerUserService.getRecipientEmailList(item);
          this.pusherService.sendPushNotification(
            recipientEmailArray,
            'New Note',
            'WO number is ' +
            wo.number +
            ' New Note: ' +
            createCustomerNoteDto.message,
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else if (createCustomerNoteDto.senderType === 1) {
      //send email notification to assigned technicians when new customer note is added
      let recipientEmailArray = [];
      for (let tech of wo.assignedTechs) {
        recipientEmailArray.push(tech.user.email);
      }

      try {
        const mailOptions = {
          from: config.mail.supportEmail,
          to: recipientEmailArray, // list of receivers (separated by ,)
          subject: 'New Customer Note',
          text: 'New Customer Note',
          html:
            `WO#: ${wo.number ? wo.number : 'N/A'}` +
            '<br/>' +
            `Customer: ${wo.customer.companyName}` +
            '<br/>' +
            `New Customer Note: ${createCustomerNoteDto.message}` +
            '<br/>' +
            `Customer Note Sender: ${createCustomerNoteDto.customerSender.name}`,
        };
        this.emailService.sendEmail(mailOptions);
      } catch (e) {
        console.log(e);
      }

      //send push notification to assigned technicians when new customer note is added
      try {
        this.pusherService.sendPushNotification(
          recipientEmailArray,
          'New Customer Note',
          'WO number is ' +
          wo.number +
          ' New Customer Note: ' +
          createCustomerNoteDto.message,
        );
      } catch (e) {
        console.log(e);
      }
    }

    return this.customerNoteRepository.save(createCustomerNoteDto);
  }

  getAllByWoId(woId: number) {
    return this.customerNoteRepository.find({
      where: { wo: { id: woId } },
      relations: ['sender', 'customerSender'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.customerNoteRepository.find();
  }

  findOne(id: number) {
    return this.customerNoteRepository.findOneBy({ id });
  }

  update(id: number, updateCustomerNoteDto: UpdateCustomerNoteDto) {
    return this.customerNoteRepository.update(id, updateCustomerNoteDto);
  }

  remove(id: number) {
    return this.customerNoteRepository.delete(id);
  }
}
