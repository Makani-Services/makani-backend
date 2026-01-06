import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from 'class-validator';

export class UserRoleUpdateDto {
  @ApiProperty({
    type: Array<number>
  })
  @IsArray()
  roles: number[]; // array of role ids
}
