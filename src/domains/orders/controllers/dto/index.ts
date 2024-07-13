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

export class generatePaymentRefDTO {
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

  @ApiProperty({
    description: 'Event ticket id',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly ticketId!: string;

  @ApiProperty({
    description: 'order quantity',
    example: 10,
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly quantity!: number;
}
