import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InviteEntity } from './entities/invite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import config from 'src/config';
import { FRONTEND_URL } from 'src/core/common/common';
import { EmailService } from 'src/email/email.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReportEntity } from 'src/report/entities/report.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class InviteService extends TypeOrmCrudService<InviteEntity> {
  constructor(
    @InjectRepository(InviteEntity) repo: Repository<InviteEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ReportEntity)
    private reportRepository: Repository<ReportEntity>,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {
    super(repo);
  }

  async create(body: {
    invitedBy: UserEntity;
    email: string;
    role: any;
    branch: any;
    company: string;
  }) {
    const { invitedBy, email, role, branch, company } = body;

    let inviteEntity = await this.repo.findOneBy({ email });
    if (inviteEntity) {
      await this.repo.delete(inviteEntity.id);
    }

    let user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new HttpException(
        'User already registered in Makani',
        HttpStatus.BAD_REQUEST,
      );
    }

    let token = (Math.floor(Math.random() * 9000000) + 1000000).toString();
    let newInviteEntity = new InviteEntity({
      email: email,
      invitedBy: invitedBy,
      role: role,
      token,
      branch,
      company,
    });

    const mailOptions = {
      from: config.mail.supportEmail,
      to: email, // list of receivers (separated by ,)
      subject: `You are invited to Makani`,
      text: `You are invited to Makani`,
      html: `${invitedBy.name} invited you to Makani.  Please click <a href="${FRONTEND_URL}/invite?token=${token}">this link</a> to accept. <br/><br/>`,
    };

    const sent = await this.emailService.sendEmail(mailOptions);

    try {
      await this.repo.save(newInviteEntity);
      return newInviteEntity;
    } catch (e) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async accept(token: string, name: string, password: string) {
    try {
      let inviteEntity: InviteEntity = await this.repo.findOne({
        where: {
          token: token,
        },
        relations: ['invitedBy', 'role', 'branch'],
      });

      if (!inviteEntity) {
        throw new HttpException(
          'Invalid invitation token',
          HttpStatus.BAD_REQUEST,
        );
      }

      let invitedBy: UserEntity = await this.userRepository.findOneBy({
        id: inviteEntity.invitedBy.id,
      });

      if (!invitedBy) {
        throw new HttpException('Inviter not found', HttpStatus.BAD_REQUEST);
      }

      //create account
      let userEntity: UserEntity = new UserEntity();
      userEntity.email = inviteEntity.email;
      userEntity.emailVerified = true;
      userEntity.name = name;
      userEntity.company = inviteEntity.company;
      userEntity.roles = [inviteEntity.role];
      userEntity.branches = [inviteEntity.branch];
      const salt = await bcrypt.genSalt();
      userEntity.password = await bcrypt.hash(password, salt);
      const savedUser = await this.userRepository.save(userEntity);

      inviteEntity.accepted = true;
      await this.repo.save(inviteEntity);

      //check if the user should be added to the daily timecard
      if (inviteEntity.company === 'rscs') {
        let reports = await this.reportRepository.findBy({
          branch: { id: inviteEntity.branch.id },
          type: 20,
          cycle: 2,
        });
        for (const report of reports) {
          if (report) {
            if (
              inviteEntity.role.name === 'Technician' ||
              inviteEntity.role.name === 'Manager'
            ) {
              let allTechnicians = await this.userService.getUsersWithRole(
                inviteEntity.role.name,
                inviteEntity.branch.id,
                inviteEntity.company,
              );
              let allTechnicianIds = allTechnicians
                .filter((user) => user.isEnabled === true)
                .filter((user) => user.id !== savedUser.id)
                .map((user) => String(user.id));
              let technicianIds = report.technicians
                ? report.technicians.split(',').filter((id) => id)
                : [];

              // ensure daily timecard includes every active technician/manager
              const hasAllTechnicians = allTechnicianIds.every((id) =>
                technicianIds.includes(id),
              );

              if (hasAllTechnicians) {
                await this.reportRepository.update(report.id, {
                  technicians: [...technicianIds, String(savedUser.id)].join(
                    ',',
                  ),
                });
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(branchId?: number, company?: string) {
    console.log('🚀 ~ InviteService ~ findAll ~ company:', branchId, company);
    try {
      let query = this.repo
        .createQueryBuilder('invite')
        .where('invite.company = :company', { company })
        .leftJoinAndSelect('invite.role', 'role')
        .leftJoinAndSelect('invite.branch', 'branch');

      if (branchId && branchId > 0) {
        query = query.andWhere('branch.id = :branchId', { branchId });
      }

      return await query.getMany();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch invites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number) {
    try {
      const result = await this.repo.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Invite not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete invite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
