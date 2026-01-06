import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { MaterialCategoryEntity } from './entities/material-category.entity';
import { MaterialTypeEntity } from './entities/material-type.entity';
import { WoMaterialEntity } from './entities/wo-material.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(MaterialCategoryEntity)
    private readonly categoryRepository: Repository<MaterialCategoryEntity>,
    @InjectRepository(MaterialTypeEntity)
    private readonly typeRepository: Repository<MaterialTypeEntity>,
    @InjectRepository(WoMaterialEntity)
    private readonly woMaterialRepository: Repository<WoMaterialEntity>,
    @InjectRepository(WoEntity)
    private readonly woRepository: Repository<WoEntity>,
  ) {}

  async listCategories(company: string): Promise<MaterialCategoryEntity[]> {
    return this.categoryRepository.find({
      relations: ['materialTypes'],
      order: { createdAt: 'ASC' },
      where: { company },
    });
  }

  async createCategory(
    name: string,
    unit: string,
    isMandatory: boolean,
    company: string,
  ) {
    if (!name || !unit || isMandatory === undefined) {
      throw new HttpException(
        'Category name and unit are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.categoryRepository.findOne({
      where: { name, company },
    });
    if (existing) {
      throw new HttpException(
        'Material category already exists',
        HttpStatus.CONFLICT,
      );
    }

    const category = new MaterialCategoryEntity({
      name,
      unit,
      isMandatory,
      company,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, payload: Partial<MaterialCategoryEntity>) {
    return await this.categoryRepository.update(id, payload);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Material category not found');
    }
    await this.categoryRepository.remove(category);
    return { deleted: true };
  }

  async listMaterialTypes(categoryId?: number) {
    const where = categoryId ? { category: { id: categoryId } } : {};
    return this.typeRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async createMaterialType(name: string, categoryId: number) {
    if (!name || !categoryId) {
      throw new HttpException(
        'Material type name and categoryId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Material category not found');
    }

    const duplicate = await this.typeRepository.findOne({
      where: { name, category: { id: categoryId } },
      relations: ['category'],
    });
    if (duplicate) {
      throw new HttpException(
        'Material type already exists in this category',
        HttpStatus.CONFLICT,
      );
    }

    const type = new MaterialTypeEntity({ name, category });
    return this.typeRepository.save(type);
  }

  async updateMaterialType(id: number, payload: Partial<MaterialTypeEntity>) {
    return await this.typeRepository.update(id, payload);
  }

  async deleteMaterialType(id: number) {
    const type = await this.typeRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException('Material type not found');
    }
    await this.typeRepository.remove(type);
    return { deleted: true };
  }

  async listWoMaterials(woId: number) {
    const workOrder = await this.woRepository.findOne({ where: { id: woId } });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return this.woMaterialRepository.find({
      where: { workOrder: { id: woId } },
      relations: ['materialType', 'materialCategory', 'workOrder'],
      order: { id: 'ASC' },
    });
  }

  async addWoMaterial(
    woId: number,
    materialCategoryId: number,
    materialTypeId: number,
    quantity: number,
    isAdded: boolean,
  ) {
    console.log('🚀 ~ MaterialService ~ addWoMaterial ~ woId:', woId);
    console.log(
      '🚀 ~ MaterialService ~ addWoMaterial ~ materialCategoryId:',
      materialCategoryId,
    );
    console.log(
      '🚀 ~ MaterialService ~ addWoMaterial ~ materialTypeId:',
      materialTypeId,
    );
    console.log('🚀 ~ MaterialService ~ addWoMaterial ~ quantity:', quantity);
    console.log('🚀 ~ MaterialService ~ addWoMaterial ~ isAdded:', isAdded);

    if (!woId || !materialCategoryId) {
      throw new HttpException(
        'woId and materialCategoryId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingMaterial = await this.woMaterialRepository.findOne({
      where: {
        workOrder: { id: woId },
        materialCategory: { id: materialCategoryId },
      },
    });
    console.log(
      '🚀 ~ MaterialService ~ addWoMaterial ~ existingMaterial:',
      existingMaterial,
    );
    if (existingMaterial) {
      let payload: Partial<{
        materialType: MaterialTypeEntity;
        quantity: number;
        isAdded: boolean;
      }> = {};

      if (materialTypeId) {
        payload.materialType = await this.typeRepository.findOne({
          where: { id: materialTypeId },
          relations: ['category'],
        });
      }
      if (quantity) {
        payload.quantity = quantity;
      }
      if (isAdded !== undefined) {
        payload.isAdded = isAdded;
        if (isAdded === false) {
          payload.quantity = null;
          payload.materialType = null;
        }
      }
      return this.updateWoMaterial(existingMaterial.id, payload);
    }

    let woMaterialEntity = new WoMaterialEntity();

    const workOrder = await this.woRepository.findOne({ where: { id: woId } });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    console.log('🚀 ~ MaterialService ~ addWoMaterial ~ isAdded:', isAdded);
    woMaterialEntity.workOrder = workOrder;
    woMaterialEntity.isAdded = isAdded;

    if (materialCategoryId) {
      const materialCategory = await this.categoryRepository.findOne({
        where: { id: materialCategoryId },
      });
      if (!materialCategory) {
        throw new NotFoundException('Material category not found');
      }
      woMaterialEntity.materialCategory = materialCategory;
    }

    if (materialTypeId) {
      const materialType = await this.typeRepository.findOne({
        where: { id: materialTypeId },
        relations: ['category'],
      });
      if (!materialType) {
        throw new NotFoundException('Material type not found');
      }
      woMaterialEntity.materialType = materialType;
    }
    if (quantity) {
      const normalizedQuantity = Number(quantity);
      if (Number.isNaN(normalizedQuantity) || normalizedQuantity <= 0) {
        throw new HttpException(
          'Quantity must be a positive number',
          HttpStatus.BAD_REQUEST,
        );
      }
      woMaterialEntity.quantity = normalizedQuantity;
    }

    return this.woMaterialRepository.save(woMaterialEntity);
  }

  async updateWoMaterial(
    id: number,
    payload: Partial<{
      materialTypeId: number;
      quantity: number;
      isAdded: boolean;
    }>,
  ) {
    return this.woMaterialRepository.update(id, payload);

    // const woMaterial = await this.woMaterialRepository.findOne({
    //   where: { id },
    //   relations: ['materialType', 'workOrder'],
    // });
    // if (!woMaterial) {
    //   throw new NotFoundException('Work order material not found');
    // }
    // if (payload.materialTypeId) {
    //   const materialType = await this.typeRepository.findOne({
    //     where: { id: payload.materialTypeId },
    //     relations: ['category'],
    //   });
    //   if (!materialType) {
    //     throw new NotFoundException('Material type not found');
    //   }
    //   woMaterial.materialType = materialType;
    // }
    // if (payload.quantity !== undefined) {
    //   const normalizedQuantity = Number(payload.quantity);
    //   if (Number.isNaN(normalizedQuantity) || normalizedQuantity <= 0) {
    //     throw new HttpException(
    //       'Quantity must be a positive number',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    //   woMaterial.quantity = normalizedQuantity;
    // }
    // if (payload.isAdded !== undefined) {
    //   woMaterial.isAdded = payload.isAdded;
    // }
    // return this.woMaterialRepository.save(woMaterial);
  }

  async deleteWoMaterial(id: number) {
    const woMaterial = await this.woMaterialRepository.findOne({
      where: { id },
    });
    if (!woMaterial) {
      throw new NotFoundException('Work order material not found');
    }
    await this.woMaterialRepository.remove(woMaterial);
    return { deleted: true };
  }
}
