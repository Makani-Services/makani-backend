import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from 'class-validator';
import { RoleEntity } from "src/role/entities/role.entity";
import { JoinColumn } from "typeorm";

export class UserDto {
  @ApiPropertyOptional({
    type: Number
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String
  })
  @IsString()
  email: string;

  @ApiProperty({
    type: Array<RoleEntity>
  })
  @JoinColumn()
  roles: RoleEntity[];
}
