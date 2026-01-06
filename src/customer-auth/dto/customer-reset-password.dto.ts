export class CustomerResetPasswordDto {
  readonly email: string;
  readonly newPassword: string;
  readonly newPasswordToken: string;
  readonly currentPassword: string;
}
