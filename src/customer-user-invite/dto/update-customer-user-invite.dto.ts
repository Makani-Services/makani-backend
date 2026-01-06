import { PartialType } from '@nestjs/swagger';
import { CreateCustomerUserInviteDto } from './create-customer-user-invite.dto';

export class UpdateCustomerUserInviteDto extends PartialType(CreateCustomerUserInviteDto) {}
