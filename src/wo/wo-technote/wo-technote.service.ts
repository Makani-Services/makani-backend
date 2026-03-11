import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WoTechNoteEntity } from '../entities/wotechnote.entity';
import { WoEntity } from '../entities/wo.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class WoTechNoteService {
  constructor(
    @InjectRepository(WoTechNoteEntity)
    private readonly woTechNoteRepo: Repository<WoTechNoteEntity>,
  ) {}

  async create(createDto) {
    const newNote = new WoTechNoteEntity();
    newNote.note = createDto.note;
    newNote.wo = { id: createDto.woId } as WoEntity;
    newNote.createdBy = { id: createDto.createdById } as UserEntity;

    const result = await this.woTechNoteRepo.save(newNote);
    const note = await this.woTechNoteRepo.findOne({
      where: { id: result.id },
      relations: ['createdBy'],
    });
    return note;
  }

  async findAll(woId?: number) {
    return await this.woTechNoteRepo.find({
      where: { wo: { id: woId } },
      relations: ['createdBy'],
    });
  }

  async getAllByWoId(woId: number) {
    return await this.woTechNoteRepo.find({
      where: { wo: { id: woId } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const note = await this.woTechNoteRepo.findOne({
      where: { id },
      relations: ['createdBy', 'wo'],
    });

    if (!note) {
      throw new NotFoundException(`WoTechNote with ID ${id} not found`);
    }

    return note;
  }

  async update(id: number, updateDto: Partial<WoTechNoteEntity>) {
    const note = await this.findOne(id);
    Object.assign(note, updateDto);
    return await this.woTechNoteRepo.save(note);
  }

  async remove(id: number) {
    const note = await this.findOne(id);
    return await this.woTechNoteRepo.remove(note);
  }
}
