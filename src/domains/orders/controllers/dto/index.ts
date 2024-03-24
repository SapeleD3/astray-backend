import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsEmail,
  IsNumber,
} from 'class-validator';

export class generatePasswordRefDTO {
  @ApiProperty({
    description: 'payment amount',
    example: 1000,
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount!: number;

  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Length(0, 255)
  readonly email!: string;
}
