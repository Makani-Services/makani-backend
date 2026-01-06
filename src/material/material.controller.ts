import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { MaterialService } from './material.service';

@Controller('api/material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get('categories')
  async getCategories(@Headers() headers: any) {
    return this.materialService.listCategories(headers.company);
  }

  @Post('categories')
  async createCategory(@Body() body: any, @Headers() headers: any) {
    return this.materialService.createCategory(
      body.name,
      body.unit,
      body.isMandatory,
      headers.company,
    );
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.materialService.updateCategory(Number(id), body);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.materialService.deleteCategory(Number(id));
  }

  @Get('types')
  async getTypes(@Query('categoryId') categoryId?: string) {
    return this.materialService.listMaterialTypes(
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Post('types')
  async createType(@Body() body: any) {
    return this.materialService.createMaterialType(
      body.name,
      Number(body.categoryId),
    );
  }

  @Patch('types/:id')
  async updateType(@Param('id') id: string, @Body() body: any) {
    console.log('🚀 ~ MaterialController ~ updateType ~ body:', body);
    return this.materialService.updateMaterialType(Number(id), body);
  }

  @Delete('types/:id')
  async deleteType(@Param('id') id: string) {
    return this.materialService.deleteMaterialType(Number(id));
  }

  @Get('wo/:woId/materials')
  async getWoMaterials(@Param('woId') woId: string) {
    return this.materialService.listWoMaterials(Number(woId));
  }

  @Post('wo/materials')
  async addWoMaterial(@Body() body: any) {
    return this.materialService.addWoMaterial(
      Number(body.woId),
      Number(body.materialCategoryId),
      Number(body.materialTypeId),
      Number(body.quantity),
      Boolean(body.isAdded),
    );
  }

  @Patch('wo/materials/:id')
  async updateWoMaterial(@Param('id') id: string, @Body() body: any) {
    return this.materialService.updateWoMaterial(Number(id), {
      materialTypeId: body.materialTypeId
        ? Number(body.materialTypeId)
        : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      isAdded: body.isAdded !== undefined ? Boolean(body.isAdded) : undefined,
    });
  }

  @Delete('wo/materials/:id')
  async deleteWoMaterial(@Param('id') id: string) {
    return this.materialService.deleteWoMaterial(Number(id));
  }
}
