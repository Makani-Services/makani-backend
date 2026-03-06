import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WoAdminNoteEntity } from '../entities/woadminnote.entity';
import { WoEntity } from '../entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class WoAdminNoteService {
  constructor(
    @InjectRepository(WoAdminNoteEntity)
    private readonly woAdminNoteRepo: Repository<WoAdminNoteEntity>,
  ) { }

  async create(createDto) {
    const newNote = new WoAdminNoteEntity();
    newNote.note = createDto.note;
    newNote.wo = { id: createDto.woId } as WoEntity;
    newNote.createdBy = { id: createDto.createdById } as UserEntity;

    let result = await this.woAdminNoteRepo.save(newNote);
    const note = await this.woAdminNoteRepo.findOne({
      where: { id: result.id },
      relations: ['createdBy'],
    });
    return note;
  }

  async findAll(woId?: number) {
    return await this.woAdminNoteRepo.find({
      where: { wo: { id: woId } },
      relations: ['createdBy'],
      // order: { createdAt: 'DESC' },
    });

  }

  async getAllByWoId(woId: number) {
    return await this.woAdminNoteRepo.find({
      where: { wo: { id: woId } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const note = await this.woAdminNoteRepo.findOne({
      where: { id },
      relations: ['createdBy', 'wo'],
    });

    if (!note) {
      throw new NotFoundException(`WoAdminNote with ID ${id} not found`);
    }

    return note;
  }

  async update(id: number, updateDto: Partial<WoAdminNoteEntity>) {
    const note = await this.findOne(id);
    Object.assign(note, updateDto);
    return await this.woAdminNoteRepo.save(note);
  }

  async remove(id: number) {
    const note = await this.findOne(id);
    return await this.woAdminNoteRepo.remove(note);
  }
}
