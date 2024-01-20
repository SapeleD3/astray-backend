import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponse {
  @ApiProperty({
    description: 'The health status of the API.',
    example: 'OK',
    type: String,
  })
  @Expose({ name: 'status' })
  readonly status: string;

  constructor(data: { status: string }) {
    this.status = data.status;
  }
}
