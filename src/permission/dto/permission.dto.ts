import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
// import { MenuEntity } from "src/menu/entities/menu.entity";
import { RoleEntity } from 'src/role/entities/role.entity';

export class PermissionDto {
  @ApiPropertyOptional({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    uniqueItems: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: () => [RoleEntity] })
  roles: RoleEntity[];

  // @ApiProperty({ type: () => [MenuEntity] })
  // menus: MenuEntity[];
}
