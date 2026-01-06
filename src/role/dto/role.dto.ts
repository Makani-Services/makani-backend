import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PermissionEntity } from "src/permission/entities/permission.entity";

export class RoleDto {
  @ApiPropertyOptional({
    type: Number
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: () => [PermissionEntity] })
  permissions: PermissionEntity[];
}
