import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCustomerNoteDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsNotEmpty()
  senderType: number;
  // 0: sender is technician
  // 1: sender is customer

  @IsNumber()
  @IsNotEmpty()
  woId: number;

  @IsNumber()
  @IsOptional()
  senderId?: number;

  @IsNumber()
  @IsOptional()
  customerSenderId?: number;
}
