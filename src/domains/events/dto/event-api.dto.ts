import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventTicketPayload } from '../services';

export class EventTicketParams {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  readonly price!: number;

  @IsNotEmpty()
  @IsNumber()
  readonly sold!: number;
}

export class EventCreationRequest {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsString()
  readonly address!: string;

  @IsNotEmpty()
  @IsString()
  readonly category!: string;

  @IsNotEmpty()
  @IsString()
  readonly country!: string;

  @IsNotEmpty()
  @IsString()
  readonly state!: string;

  @IsNotEmpty()
  @IsString()
  readonly description!: string;

  @IsNotEmpty()
  @IsDateString()
  readonly endDate!: string;

  @IsNotEmpty()
  @IsDateString()
  readonly startDate!: string;

  @IsNotEmpty()
  @IsString()
  readonly image!: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventTicketParams)
  readonly tickets!: EventTicketPayload[];
}
