import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import writeXlsxFile from 'write-excel-file/node';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RoleEntity } from 'src/role/entities/role.entity';
import { In, Not, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import * as nodemailer from 'nodemailer';
import { default as config } from '../config';
import * as fs from 'fs';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';
import { formatDate } from 'src/core/common/common';

@Injectable()
export class UserService extends TypeOrmCrudService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) repo: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    private readonly companyService: CompanyService,
  ) {
    super(repo);
  }

  // async findByEmail(email: string): Promise<UserEntity> {
  //   return await this.repo.findOneBy({ email: email });
  // }

  // async findById(id: number): Promise<UserEntity> {
  //   return await this.repo.findOneBy({ id: id });
  // }

  async getAll(company: string) {
    return await this.repo.find({ where: { company: company } });
  }

  async getAllUsers(
    branchId: number,
    role = null,
    company: string,
  ): Promise<UserEntity[]> {
    let branch = Number(branchId);
    let result;
    if (role === 'Administrator') {
      let query = this.repo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('user.branches', 'branches')
        .where('roles.name != :roleName', { roleName: 'Administrator' })
        .andWhere('user.company = :company', { company })
        .orderBy('user.name', 'ASC')
        .addOrderBy('branches.id', 'ASC');
      result = await query.getMany();
    } else if (role === 'Manager') {
      let query = this.repo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('user.branch', 'branch')
        .where('roles.name NOT IN (:...excludedRoles)', {
          excludedRoles: ['Administrator', 'Manager'],
        })
        .andWhere('user.company = :company', { company })
        .orderBy('user.name', 'ASC')
        .addOrderBy('branches.id', 'ASC');

      result = await query.getMany();
    } else {
      let query = this.repo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('user.branches', 'branches')
        .where('user.company = :company', { company })
        .orderBy('user.name', 'ASC')
        .addOrderBy('branches.id', 'ASC');
      result = await query.getMany();
    }

    if (branch > 0) {
      result = result.filter((user) => {
        let branchIds = user.branches.map((branch) => branch.id);
        return branchIds.includes(branch);
      });
    }
    return result;
  }

  async getUsersWithRole(role, branchId = 0, company): Promise<UserEntity[]> {
    let branch = Number(branchId);
    let query = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.branches', 'branches')
      .where('roles.name = :role', { role })
      .andWhere('user.company = :company', { company })
      .orderBy('user.name', 'ASC')
      .addOrderBy('branches.id', 'ASC');
    let result = await query.getMany();
    if (branch > 0) {
      result = result.filter((user) => {
        let branchIds = user.branches.map((branch) => branch.id);
        return branchIds.includes(branch);
      });
    }
    return result;
  }

  async createNewUser(newUser: CreateUserDto): Promise<UserEntity> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      //check if company is valid
      // let companyItem = await this.companyService.getOneCompany(
      //   newUser.company.toLowerCase(),
      // );
      // if (!companyItem) {
      //   throw new HttpException('Invalid Company', HttpStatus.BAD_REQUEST);
      // }

      //check email is already registered
      var userRegistered = await this.repo.findOneBy({ email: newUser.email });
      if (!userRegistered) {
        var createdUser = new UserEntity(newUser);

        if (createdUser.email == 'roland@makani.services') {
          var adminRole: RoleEntity = await this.roleRepo.findOne({
            where: { id: 1 },
          });
          createdUser.roles = [adminRole];
        } else {
          var userRole: RoleEntity = await this.roleRepo.findOne({
            where: { id: 5 },
          });
          createdUser.roles = [userRole];
        }

        return await this.repo.save(createdUser);
        // } else if (!userRegistered.emailVerified) {
        //   return userRegistered;
      } else {
        throw new HttpException(
          'Email is already taken',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        'Please fill in all fields',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  isValidEmail(email: string) {
    if (email) {
      var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } else return false;
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    var userFromDb = await this.repo.findOneBy({ email: email });

    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const isOldPassword = await userFromDb.checkPassword(newPassword);
    if (!isOldPassword) {
      userFromDb.password = newPassword;
      await this.repo.save(userFromDb);
      return true;
    } else {
      throw new HttpException('Provide New Password', HttpStatus.BAD_REQUEST);
    }
  }

  async updateRoles(user: UserEntity, roleIds: number[]) {
    try {
      user.roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
      this.repo.save(user);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteOneUser(userId: number): Promise<Boolean> {
    const result = await this.repo.update(userId, { isEnabled: false });
    return result.affected > 0;
  }

  async restoreOneUser(userId: number): Promise<Boolean> {
    const result = await this.repo.update(userId, { isEnabled: true });
    return result.affected > 0;
  }

  async updateUsers(userData: any): Promise<Boolean> {
    for (let user of userData) {
      let userEntity = new UserEntity(user);
      await this.repo.save(userEntity);
    }
    return true;
  }

  async updateUser(userData): Promise<UserEntity> {
    var user: UserEntity = await this.repo.findOneBy({ id: userData.id });
    if (user) {
      var updatedUser = new UserEntity(userData);
      return await this.repo.save(updatedUser);
    } else {
      throw new NotFoundException(`User not found`);
    }
    // return await this.repo.save(user);
  }

  async uploadFile(fileName: string, id: number): Promise<UserEntity> {
    var user: UserEntity = await this.repo.findOne({
      where: { id: id },
      relations: ['roles', 'roles.permissions'],
    });

    if (user.avatar != 'default.png') {
      const filePath = `public/avatars/${user.avatar}`;
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.log(`Error deleting file '${user.avatar}': ${err.message}`);
      }
    }
    user.avatar = fileName;
    return await this.repo.save(user);
  }

  async getUsers(ids: number[]) {
    return await this.repo.find({ where: { id: In(ids) } });
  }

  getUserById = async (userId) => {
    let query = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.branches', 'branches')
      .where('user.id = :userId', { userId })
      .addOrderBy('branches.id', 'ASC');

    return await query.getOne();
  };

  async getManagersAndClericals() {
    return await this.repo
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.id <= :ID', { ID: 3 })
      .getMany();
  }

  async getRecipientEmailArray(item) {
    let userIdArray = item.recipientList.split(',');
    let allUsers = await this.repo.find({ where: { isEnabled: true } });
    let recipientArray = allUsers.filter((user) =>
      userIdArray.includes(String(user.id)),
    );
    let recipientEmailArray = recipientArray.map((user) => user.email);
    return recipientEmailArray;
  }

  async getRecipientEmailList(item) {
    let userIdArray = item.recipientList.split(',');
    let allUsers = await this.repo.find({ where: { isEnabled: true } });
    let recipientArray = allUsers.filter((user) =>
      userIdArray.includes(String(user.id)),
    );
    let recipientEmailArray = recipientArray.map((user) => user.email);
    return recipientEmailArray;
  }

  async getRecipientEmailListForReport(recipients, company) {
    let userIdArray = recipients.split(',');
    let allUsers = await this.repo.find({
      where: { company: company, isEnabled: true },
    });

    let recipientArray = allUsers.filter((user) =>
      userIdArray.includes(String(user.id)),
    );
    let recipientEmailArray = recipientArray.map((user) => user.email);
    return recipientEmailArray;
  }

  async checkHasLoggedHoursToday(userId: number): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id: userId } });
    return user.hasLoggedHoursToday;
  }

  async confirmLoggedHours(userId: number): Promise<UpdateResult> {
    return await this.repo.update(userId, { hasLoggedHoursToday: true });
  }

  async generateExcelForTeamManage(
    branch: number,
    company: string,
  ): Promise<string> {
    console.log(
      '🚀 ~ UserService ~ generateExcelForTeamManage ~ branch:',
      typeof branch,
    );
    const users = await this.getAllUsers(branch, null, company);
    let data = [];
    for (let user of users) {
      const row = {
        name: user.name,
        email: user.email,
        role: user.roles[0].name,
        branch: user.branches.map((branch) => branch.name).join(', '),
        addedDate: formatDate(user.createdAt, 'MM/DD/YYYY - HH:mm'),
      };
      data.push(row);
    }
    const fileName = `Team_Manage_report.xlsx`;
    const filePath = `./public/${company}/reports/${fileName}`;
    if (!fs.existsSync(`./public/${company}/reports/`)) {
      fs.mkdirSync(`./public/${company}/reports/`, { recursive: true });
    }
    const schema = [
      {
        column: 'Name',
        type: String,
        width: 25,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.name,
      },
      {
        column: 'Email',
        type: String,
        width: 35,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.email,
      },
      {
        column: 'Role',
        type: String,
        width: 15,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.role,
      },
      {
        column: 'Branch',
        type: String,
        width: 70,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.branch,
      },
      {
        column: 'Added Date',
        type: String,
        width: 20,
        wrap: true,
        align: 'center',
        alignVertical: 'center',
        value: (order) => order.addedDate,
      },
    ];
    await writeXlsxFile(data, {
      schema,
      headerStyle: {
        backgroundColor: '#eeeeee',
        fontWeight: 'bold',
        align: 'center',
      },
      filePath: filePath,
    });

    return fileName;
  }

  // async deleteOneUser(userId: number): Promise<Boolean> {
  //   const { affected } = await this.repo.delete(userId);

  //   if (affected > 0) {
  //     return true;
  //   } else {
  //     throw new NotFoundException(`User not found`);
  //   }
  // }
}
