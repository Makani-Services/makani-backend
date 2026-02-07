import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryService } from 'src/history/history.service';
import { WoEntity } from '../entities/wo.entity';

@Injectable()
export class WoCustomerService {
    constructor(
        @InjectRepository(WoEntity) private readonly woRepo: Repository<WoEntity>,
        private readonly historyService: HistoryService,
    ) { }

    // async findAll(query: any, headers: any) {
    //     return [];
    // }

    async update(id: string, updateDto: any) {
        const woId = +id;
        const wo = await this.woRepo.findOne({ where: { id: woId } });
        if (!wo) {
            throw new NotFoundException(`Work order with ID ${id} not found`);
        }
        await this.saveHistoryForCustomerUpdate(wo, updateDto);
        return await this.woRepo.update(woId, updateDto);
    }

    private async saveHistoryForCustomerUpdate(wo: WoEntity, updateDto: any) {
        if (!updateDto) {
            return;
        }
        const actorPrefix = updateDto.eventUser ? 'updated' : 'customer updated';
        const entries: string[] = [];

        for (const [key, value] of Object.entries(updateDto)) {
            if (key === 'eventUser') {
                continue;
            }
            const previousValue = (wo as unknown as Record<string, unknown>)[key];
            const description = `${actorPrefix} ${key} from ${this.formatHistoryValue(
                previousValue,
            )} to ${this.formatHistoryValue(value)}`;
            entries.push(description);
        }

        for (const description of entries) {
            await this.historyService.create({
                user: updateDto.eventUser,
                wo: wo.id,
                description,
            });
        }
    }

    private formatHistoryValue(value: unknown) {
        if (value === null || value === undefined) {
            return 'empty';
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length ? trimmed : 'empty';
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }
}
