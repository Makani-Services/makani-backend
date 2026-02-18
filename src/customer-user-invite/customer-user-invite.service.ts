import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerUserInviteDto } from './dto/create-customer-user-invite.dto';
import { UpdateCustomerUserInviteDto } from './dto/update-customer-user-invite.dto';
import { CustomerUserInviteEntity } from './entities/customer-user-invite.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { CustomerUserService } from 'src/customer-user/customer-user.service';
import config from 'src/config';
import { CUSTOMER_FRONTEND_URL, FRONTEND_URL } from 'src/core/common/common';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';

@Injectable()
export class CustomerUserInviteService {
  constructor(
    @InjectRepository(CustomerUserInviteEntity)
    private customerUserInviteRepository: Repository<CustomerUserInviteEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(CustomerUserEntity)
    private customerUserRepository: Repository<CustomerUserEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CustomerRoleEntity)
    private customerRoleRepository: Repository<CustomerRoleEntity>,
    @InjectRepository(CustomerLocationEntity)
    private customerLocationRepository: Repository<CustomerLocationEntity>,
    private readonly emailService: EmailService,
    private readonly customerUserService: CustomerUserService,
  ) { }

  async create(
    createCustomerUserInviteDto: CreateCustomerUserInviteDto,
    company: string,
  ) {
    // Check if customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: createCustomerUserInviteDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if invitedBy user exists (if provided)
    let invitedByUser: UserEntity | null = null;
    if (createCustomerUserInviteDto.invitedById) {
      invitedByUser = await this.userRepository.findOne({
        where: { id: createCustomerUserInviteDto.invitedById },
      });

      if (!invitedByUser) {
        throw new NotFoundException('InvitedBy user not found');
      }
    }

    // Check if invitedByAdmin user exists (if provided)
    let invitedByAdminUser: CustomerUserEntity | null = null;
    if (createCustomerUserInviteDto.invitedByAdminId) {
      invitedByAdminUser = await this.customerUserRepository.findOne({
        where: { id: createCustomerUserInviteDto.invitedByAdminId },
      });

      if (!invitedByAdminUser) {
        throw new NotFoundException('InvitedByAdmin user not found');
      }
    }

    // Check if invite already exists for this email and customer
    const existingInvite = await this.customerUserInviteRepository.findOne({
      where: {
        email: createCustomerUserInviteDto.email,
        customer: { id: createCustomerUserInviteDto.customerId },
      },
    });

    if (existingInvite) {
      throw new ConflictException(
        'Invite already exists for this email and customer',
      );
    }

    // Generate unique token
    const token = (Math.floor(Math.random() * 9000000) + 1000000).toString();

    // Set customer role based on provided customerRoleId or default to Administrator if invitedByUser is provided
    let customerRole: CustomerRoleEntity | null = null;
    if (createCustomerUserInviteDto.customerRoleId) {
      customerRole = await this.customerRoleRepository.findOne({
        where: { id: createCustomerUserInviteDto.customerRoleId },
      });

      if (!customerRole) {
        throw new NotFoundException('Customer role not found');
      }
    } else if (invitedByUser) {
      // Default to Administrator role if invitedByUser is provided and no specific role is set
      customerRole = await this.customerRoleRepository.findOne({
        where: { name: 'Administrator' },
      });
    }

    // Check if customerLocation exists (if provided)
    let customerLocation: CustomerLocationEntity | null = null;
    if (createCustomerUserInviteDto.customerLocationId) {
      customerLocation = await this.customerLocationRepository.findOne({
        where: { id: createCustomerUserInviteDto.customerLocationId },
      });

      if (!customerLocation) {
        throw new NotFoundException('Customer location not found');
      }
    }
    console.log(
      '🚀 ~ CustomerUserInviteService ~ create ~ customerRole:',
      createCustomerUserInviteDto,
      {
        token,
        customer,
        invitedBy: invitedByUser,
        invitedByAdmin: invitedByAdminUser,
        customerRole,
        company,
      },
    );

    const invite = this.customerUserInviteRepository.create({
      ...createCustomerUserInviteDto,
      token,
      customer,
      invitedBy: invitedByUser,
      invitedByAdmin: invitedByAdminUser,
      customerRole,
      customerLocation,
      company,
    });

    // Send invitation email
    const mailOptions = {
      from: config.mail.supportEmail,
      to: createCustomerUserInviteDto.email,
      subject: `You are invited to join Makani`,
      text: `You are invited to join Makani`,
      html: `${createCustomerUserInviteDto.name}, You have been invited to join ${customer.companyName} on Makani. Please click <a href="${CUSTOMER_FRONTEND_URL}/create-account?token=${token}">this link</a> to accept the invitation. <br/><br/>`,
    };

    const sent = await this.emailService.sendEmail(mailOptions);

    try {
      return await this.customerUserInviteRepository.save(invite);
    } catch (e) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(customerId?: number, locationId?: number) {
    const whereCondition: any = { customer: { id: customerId } };

    if (locationId > 0) {
      whereCondition.customerLocation = { id: locationId };
    }

    return await this.customerUserInviteRepository.find({
      where: whereCondition,
      relations: [
        'customer',
        'invitedBy',
        'invitedByAdmin',
        'customerRole',
        'customerLocation',
      ],
    });
  }

  async findByToken(token: string) {
    const invite = await this.customerUserInviteRepository.findOne({
      where: { token },
      relations: [
        'customer',
        'invitedBy',
        'invitedByAdmin',
        'customerRole',
        'customerLocation',
      ],
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    const existingAccount = await this.customerUserRepository.findOne({
      where: { email: invite.email },
    });

    return { invite, accountExists: !!existingAccount };
  }

  async update(
    id: number,
    updateCustomerUserInviteDto: UpdateCustomerUserInviteDto,
  ) {
    const invite = await this.customerUserInviteRepository.findOne({
      where: { id },
    });

    if (updateCustomerUserInviteDto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: updateCustomerUserInviteDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      invite.customer = customer;
    }

    if (updateCustomerUserInviteDto.invitedById) {
      const invitedByUser = await this.userRepository.findOne({
        where: { id: updateCustomerUserInviteDto.invitedById },
      });

      if (!invitedByUser) {
        throw new NotFoundException('InvitedBy user not found');
      }

      invite.invitedBy = invitedByUser;
    }

    if (updateCustomerUserInviteDto.invitedByAdminId) {
      const invitedByAdminUser = await this.customerUserRepository.findOne({
        where: { id: updateCustomerUserInviteDto.invitedByAdminId },
      });

      if (!invitedByAdminUser) {
        throw new NotFoundException('InvitedByAdmin user not found');
      }

      invite.invitedByAdmin = invitedByAdminUser;
    }

    Object.assign(invite, updateCustomerUserInviteDto);
    return await this.customerUserInviteRepository.save(invite);
  }

  async acceptInvite(
    token: string,
    name: string,
    email: string,
    password: string,
  ) {
    const invite = await this.customerUserInviteRepository.findOne({
      where: { token },
    });

    if (invite.accepted) {
      throw new ConflictException('Invite has already been accepted');
    }

    // // Check if customer user already exists
    // let customerUser = await this.customerUserRepository.findOne({
    //   where: { email: email },
    // });

    // if (!customerUser) {
    //   // Create new customer user
    //   customerUser = this.customerUserRepository.create({
    //     name: name,
    //     email: email,
    //     customer: invite.customer,
    //   });
    //   await this.customerUserRepository.save(customerUser);
    // }

    // Update only the accepted field
    await this.customerUserInviteRepository.update(invite.id, {
      accepted: true,
    });

    return await this.customerUserService.createNewCustomerUser(
      name,
      email,
      password,
      invite.company,
      invite.customer.id,
      invite.customerRole?.id,
      invite.customerLocation?.id,
    );
  }

  async remove(id: number) {
    const invite = await this.customerUserInviteRepository.findOne({
      where: { id },
    });
    return await this.customerUserInviteRepository.remove(invite);
  }
}
