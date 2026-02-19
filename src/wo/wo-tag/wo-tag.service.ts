import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { WoTagEntity } from '../entities/wotag.entity';
import { WoAttachmentEntity } from '../entities/woattachment.entity';

@Injectable()
export class WoTagService {
	constructor(
		@InjectRepository(WoTagEntity)
		private readonly woTagRepo: Repository<WoTagEntity>,
		@InjectRepository(WoAttachmentEntity)
		private readonly woAttachmentRepo: Repository<WoAttachmentEntity>,
	) { }

	async create(createDto: Partial<WoTagEntity>) {
		const tag = this.woTagRepo.create(createDto);
		return await this.woTagRepo.save(tag);
	}

	async findAll() {
		return await this.woTagRepo.find({ order: { name: 'ASC' } });
	}

	async search(keyword: string) {
		return await this.woTagRepo.find({
			where: { name: ILike(`%${keyword}%`) },
			order: { name: 'ASC' },
		});
	}

	async findOne(id: number) {
		const tag = await this.woTagRepo.findOne({
			where: { id },
			relations: ['attachments'],
		});
		if (!tag) {
			throw new NotFoundException(`WoTag with ID ${id} not found`);
		}
		return tag;
	}

	async update(id: number, updateDto: Partial<WoTagEntity>) {
		const tag = await this.findOne(id);
		Object.assign(tag, updateDto);
		return await this.woTagRepo.save(tag);
	}

	async remove(id: number) {
		const tag = await this.findOne(id);
		return await this.woTagRepo.remove(tag);
	}

	async addAttachment(tagId: number, attachmentId: number) {
		const tag = await this.findOne(tagId);
		const attachment = await this.woAttachmentRepo.findOne({
			where: { id: attachmentId },
			relations: ['tags'],
		});
		if (!attachment) {
			throw new NotFoundException(`WoAttachment with ID ${attachmentId} not found`);
		}
		const alreadyLinked = attachment.tags.some((t) => t.id === tagId);
		if (!alreadyLinked) {
			attachment.tags.push(tag);
			await this.woAttachmentRepo.save(attachment);
		}
		return this.findOne(tagId);
	}

	async removeAttachment(tagId: number, attachmentId: number) {
		const attachment = await this.woAttachmentRepo.findOne({
			where: { id: attachmentId },
			relations: ['tags'],
		});
		if (!attachment) {
			throw new NotFoundException(`WoAttachment with ID ${attachmentId} not found`);
		}
		attachment.tags = attachment.tags.filter((t) => t.id !== tagId);
		await this.woAttachmentRepo.save(attachment);
		return this.findOne(tagId);
	}
}
