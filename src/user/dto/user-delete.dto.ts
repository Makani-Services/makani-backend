import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber } from 'class-validator';

export class UserDeleteDto {
  @ApiPropertyOptional({
    type: Number
  })
  @IsNumber()
  id: number;
}
