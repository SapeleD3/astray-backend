import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({
    description: 'The ID of the user.',
    example: 'A6bsIFhA12xcd',
    type: String,
  })
  readonly id!: string;

  @ApiProperty({
    description: 'The user full name',
    example: 'A short black horse',
    type: String,
  })
  readonly fullName!: string;

  @ApiProperty({
    description: 'The account host name',
    example: 'Okafor',
    type: String,
  })
  readonly hostName!: string;

  @ApiProperty({
    description: 'The user email',
    example: 'user@google.com',
    type: String,
  })
  readonly email!: string;

  @ApiProperty({
    description: 'The user phoneNumber',
    example: '07065336536',
    type: String,
  })
  readonly phoneNumber!: string;

  @ApiProperty({
    description: 'The ISO date when the user was created.',
    example: '2022-08-19T07:14:14.123Z',
    type: String,
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: 'The ISO date when the user was last updated.',
    example: '2022-08-19T07:14:14.123Z',
    type: String,
  })
  readonly updatedAt!: string;

  constructor(user: any) {
    this.id = user.id;
    this.fullName = user.fullName;

    this.hostName = user.hostName;
    this.phoneNumber = user.phoneNumber;
    this.email = user.email;

    this.updatedAt = user.updatedAt
      ? new Date(user.updatedAt).toISOString()
      : new Date().toISOString();

    this.createdAt = user.createdAt
      ? new Date(user.createdAt).toISOString()
      : new Date().toISOString();
  }
}
