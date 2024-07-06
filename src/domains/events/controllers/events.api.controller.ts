import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiGroup, RouteTag } from '../../../commons/enums';
import {
  EventAction,
  EventApiService,
  EventCategoryResponse,
  EventCreationResponse,
  PublishEventType,
  SeedEventCategoryResponse,
  UnauthEventResponse,
} from '../services';
import { EventCreationRequest } from '../dto';
import { AuthGuard } from '../../../commons/gaurds/user.authentication.guard';
import { AuthGuardRequest } from '../../../commons';

@Controller({
  path: `${RouteTag.API}/${ApiGroup.Event}`,
})
export class EventApiController {
  constructor(private readonly eventService: EventApiService) {}

  @Post('/category/seed')
  @HttpCode(HttpStatus.OK)
  async seedEventCategory(): Promise<SeedEventCategoryResponse> {
    const seedStatus = await this.eventService.seedEventCategory();
    return seedStatus;
  }

  @Get('/category')
  @HttpCode(HttpStatus.OK)
  async getEventCategories(): Promise<EventCategoryResponse[]> {
    const categories = await this.eventService.getEventCategories();
    return categories;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUnAuthEvents(
    @Query('id') id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
  ): Promise<UnauthEventResponse> {
    const filter = {
      id,
      page: page || 1,
      limit: limit || 10,
      name,
      status,
      state,
      country,
    };
    const event = await this.eventService.getUnAuthEvents(filter);
    return event;
  }
}

// authenticated routes
@UseGuards(AuthGuard)
@Controller({
  path: `${RouteTag.API}/auth/${ApiGroup.Event}`,
})
export class AuthEventApiController {
  constructor(private readonly eventService: EventApiService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  async createEvent(
    @Body() eventCreationRequest: EventCreationRequest,
    @Request() request: AuthGuardRequest,
  ): Promise<EventCreationResponse> {
    const event = await this.eventService.createEvent(
      request.id,
      eventCreationRequest,
    );
    return event;
  }

  @Post('/publish')
  @HttpCode(HttpStatus.OK)
  async publishEvent(
    @Body() publishEventPayload: PublishEventType,
    @Request() request: AuthGuardRequest,
  ): Promise<string> {
    let requiredAction = null;
    let response = '';

    if (
      publishEventPayload.delete === true &&
      publishEventPayload.publish === false
    ) {
      requiredAction = EventAction.DELETE;
      response = 'Event deleted successfully';
    }

    if (publishEventPayload.publish === true) {
      requiredAction = EventAction.PUBLISH;
      response = 'Event published successfully';
    }

    if (requiredAction) {
      await this.eventService.publishEvent(
        request.id,
        publishEventPayload.eventId,
        requiredAction,
      );
    }

    return response;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUnAuthEvents(
    @Request() request: AuthGuardRequest,
    @Query('id') id?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
  ): Promise<UnauthEventResponse> {
    const filter = {
      id,
      page: page || 1,
      limit: limit || 10,
      name,
      status,
      state,
      country,
    };
    const event = await this.eventService.getAuthEvents(request.id, filter);
    return event;
  }
}
