import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BranchEntity } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BranchService extends TypeOrmCrudService<BranchEntity> {
  constructor(@InjectRepository(BranchEntity) repo: Repository<BranchEntity>) {
    super(repo);
  }

  findAll(company: string) {
    return this.repo.find({
      where: { company: company },
      order: {
        id: 'ASC',
      },
    });
  }

  async save(data: CreateBranchDto): Promise<BranchEntity> {
    var newBranch = new BranchEntity(data);

    return await this.repo.save(newBranch);
  }

  async delete(branchId: number): Promise<Boolean> {
    const { affected } = await this.repo.delete(branchId);

    if (affected > 0) {
      return true;
    } else {
      throw new NotFoundException(`Branch not found`);
    }
  }

  async getBranchById(branchId: number): Promise<BranchEntity> {
    return await this.repo.findOneBy({ id: branchId });
  }

  async update(data: UpdateBranchDto) {
    console.log('🚀 ~ BranchService ~ update ~ data:', data);
    var updatedBranch = new BranchEntity(data);
    return await this.repo.save(updatedBranch);
  }
}
