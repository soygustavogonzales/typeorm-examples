import { createParamDecorator } from '@nestjs/common';
import { UserDecode } from '../dtos/userDecode.entity';

export const GetUser = createParamDecorator((data, req): UserDecode => {
    return req.user;
});
