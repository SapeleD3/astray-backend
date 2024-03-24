import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../commons/prisma.service';
import {
  EventCategoryResponse,
  EventCreationPayload,
  EventCreationResponse,
  GetEventsFilter,
  SeedEventCategoryResponse,
  UnauthEventResponse,
} from './types';
import { eventCategories } from './constants';
import dayjs from 'dayjs';

@Injectable()
export class EventApiService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async seedEventCategory(): Promise<SeedEventCategoryResponse> {
    const defaultEventCategory = eventCategories.map((val) => {
      return {
        name: val,
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
      };
    });

    try {
      await this.db.eventCategory.createMany({
        data: defaultEventCategory,
      });
      return { successful: true };
    } catch (error) {
      console.log('error seeding category: ', error);
      return { successful: false };
    }
  }

  async getEventCategories(): Promise<EventCategoryResponse[]> {
    const response = await this.db.eventCategory.findMany();
    return response;
  }

  async createEvent(
    userId: string,
    payload: EventCreationPayload,
  ): Promise<EventCreationResponse> {
    const {
      name,
      address,
      tickets,
      category,
      country,
      description,
      endDate,
      startDate,
      state,
      image,
    } = payload;

    const [eventCategory, user] = await Promise.all([
      this.db.eventCategory.findFirst({
        where: { id: category },
      }),
      this.db.user.findFirst({ where: { id: userId } }),
    ]);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!eventCategory) {
      throw new BadRequestException('invalid event category');
    }

    const eventTickets = tickets.map((val) => {
      return {
        name: val.name,
        quantity: val.quantity,
        price: val.price,
        userId,
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
      };
    });

    const event = await this.db.event.create({
      data: {
        eventCategoryId: category,
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
        name,
        address,
        country,
        description,
        endDate,
        startDate,
        state,
        image,
        userId,
        tickets: {
          createMany: { data: eventTickets },
        },
      },
    });

    return { eventId: event.id };
  }

  async getUnAuthEvents(filter: GetEventsFilter): Promise<UnauthEventResponse> {
    const selectCriteria = {
      id: true,
      address: true,
      image: true,
      name: true,
      startDate: true,
      endDate: true,
      country: true,
      state: true,
      description: true,
      tickets: { select: { name: true, price: true, soldOut: true, id: true } },
    };

    const whereQuery: any = {};

    if (filter?.id) whereQuery['id'] = filter.id;
    if (filter?.status) whereQuery['status'] = filter.status;
    if (filter?.name) {
      whereQuery['name'] = {
        search: filter?.name,
      };
    }

    if (filter?.country) {
      whereQuery['country'] = {
        search: filter?.country,
      };
    }
    if (filter?.state) {
      whereQuery['state'] = {
        search: filter?.state,
      };
    }

    const { limit, page } = filter;
    let totalEvents = 0;
    try {
      totalEvents = await this.db.event.count({
        where: whereQuery,
      });
    } catch (error) {
      return { events: [], pages: 0, total: totalEvents, page, limit };
    }

    const pages = Math.ceil(totalEvents / limit);
    const offset = limit * (page - 1) || 0;

    const events = await this.db.event.findMany({
      where: whereQuery,
      select: selectCriteria,
      skip: offset,
      take: limit,
    });

    return { events, pages, total: totalEvents, page, limit };
  }

  async getAuthEvents(
    userId: string,
    filter: GetEventsFilter,
  ): Promise<UnauthEventResponse> {
    const whereQuery: any = {
      userId,
    };

    if (filter?.id) whereQuery['id'] = filter.id;
    if (filter?.status) whereQuery['status'] = filter.status;
    if (filter?.name) {
      whereQuery['name'] = {
        search: filter?.name,
      };
    }

    if (filter?.country) {
      whereQuery['country'] = {
        search: filter?.country,
      };
    }
    if (filter?.state) {
      whereQuery['state'] = {
        search: filter?.state,
      };
    }

    const { limit, page } = filter;
    let totalEvents = 0;
    try {
      totalEvents = await this.db.event.count({
        where: whereQuery,
      });
    } catch (error) {
      return { events: [], pages: 0, total: totalEvents, page, limit };
    }

    const pages = Math.ceil(totalEvents / limit);
    const offset = limit * (page - 1) || 0;

    const events = await this.db.event.findMany({
      where: whereQuery,
      include: { tickets: true },
      skip: offset,
      take: limit,
    });

    return { events, pages, total: totalEvents, page, limit };
  }
}
