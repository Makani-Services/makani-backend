import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class UpdateBranchDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsString()
  readonly poStartNumber: string;

  @IsOptional()
  @IsString()
  readonly company?: string;
}
