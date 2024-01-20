import { ApiProperty } from '@nestjs/swagger';

import { AuthenticatedUser } from '../../../services';
import { UserResponse } from './';

export class AuthenticatedUserResponse {
  @ApiProperty({
    description: 'The user token',
    example: '<random token>',
    type: String,
  })
  readonly token!: string;

  @ApiProperty({
    description: 'The user details',
    example: { id: '', userId: '', firstName: '', lastName: '' },
    type: UserResponse,
  })
  readonly user!: UserResponse;

  constructor(authenticatedUser: AuthenticatedUser) {
    this.token = authenticatedUser.token;
    this.user = new UserResponse(authenticatedUser.user);
  }
}
