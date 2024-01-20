import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckResponse } from './dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the health status of the API.',
  })
  @ApiResponse({
    description: 'service is alive and kicking',
    status: HttpStatus.OK,
    type: HealthCheckResponse,
  })
  getHealthStatus(): HealthCheckResponse {
    return new HealthCheckResponse({ status: 'service is alive and kicking' });
  }
}
