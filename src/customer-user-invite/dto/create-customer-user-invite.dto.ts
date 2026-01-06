import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateCustomerUserInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  invitedById?: number;

  @IsNumber()
  @IsOptional()
  invitedByAdminId?: number;

  @IsNumber()
  @IsOptional()
  customerLocationId?: number;

  @IsString()
  @IsOptional()
  company?: string;

  @IsNumber()
  @IsOptional()
  customerRoleId?: number;
}
