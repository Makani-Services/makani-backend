import { createParamDecorator } from '@nestjs/common';

export const GetCustomerUser = createParamDecorator((data, req) => {
  return req.customerUser;
});
