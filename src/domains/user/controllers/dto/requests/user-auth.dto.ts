import { IsNotEmpty, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserSignInRequest {
  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  readonly email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password@1234',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
export class UserSignUpRequest {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @ApiProperty({
    description: 'User host name',
    example: 'JohnDoe12',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly hostName!: string;

  @ApiProperty({
    description: 'User phone number',
    example: '07065336536',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber!: string;

  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  readonly email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password@1234',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
