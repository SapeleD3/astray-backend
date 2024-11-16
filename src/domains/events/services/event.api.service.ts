import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../commons/prisma.service';
import {
  EventAction,
  EventCategoryResponse,
  EventCreationPayload,
  EventCreationResponse,
  GetEventsFilter,
  SeedEventCategoryResponse,
  UnauthEventResponse,
} from './types';
import { eventCategories } from './constants';
import dayjs from 'dayjs';
import { Event as AsEvent } from '@prisma/client';

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

  async publishEvent(
    userId: string,
    eventId: string,
    eventAction: EventAction,
  ): Promise<void> {
    const isAdmin = await this.db.admin.findFirst({ where: { id: userId } });

    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    console.log(isAdmin);

    if (eventAction === EventAction.DELETE) {
      // delete order because ticket and event are dependent on it
      await this.db.order.deleteMany({ where: { eventId } });

      // delete ticket because event are dependent on it
      await this.db.ticket.deleteMany({ where: { eventId } });

      // finally delete events
      await this.db.event.delete({ where: { id: eventId } });
    }

    if (eventAction === EventAction.PUBLISH) {
      await this.db.event.update({
        where: { id: eventId },
        data: { status: 'PUBLISHED' },
      });
    }
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
        color: val.color,
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
      status: true,
      userId: true,
      tickets: {
        select: {
          name: true,
          price: true,
          soldOut: true,
          id: true,
          sold: true,
          quantity: true,
          color: true,
        },
      },
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

    const eventOwners = events.reduce(
      (agg: { [name: string]: string }, event) => {
        if (!event.userId) {
          return agg;
        }

        if (!agg[event.userId]) {
          agg[event.userId] = event.userId;
        }

        return agg;
      },
      {},
    );

    const virtualAccount = await this.db.virtualAccount.findMany({
      where: { userId: { in: Object.keys(eventOwners) } },
    });

    const virtualAccountsByEventOwners = virtualAccount.reduce(
      (agg: { [name: string]: string | null }, vAccount) => {
        if (!agg[vAccount.userId]) {
          agg[vAccount.userId] = vAccount.subAccountNumber;
        }

        return agg;
      },
      {},
    );

    const eventsWithSubAccountNumber = events.map((val) => {
      let subAccountNumber = null;

      if (val.userId && virtualAccountsByEventOwners[val.userId]) {
        subAccountNumber = virtualAccountsByEventOwners[val.userId];
      }

      return {
        ref: subAccountNumber,
        ...val,
      };
    });

    return {
      events: eventsWithSubAccountNumber,
      pages,
      total: totalEvents,
      page,
      limit,
    };
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

    const eventsWithSubAccountNumber = events.map((val) => {
      return {
        ref: null,
        ...val,
      };
    });

    return {
      events: eventsWithSubAccountNumber,
      pages,
      total: totalEvents,
      page,
      limit,
    };
  }

  async updateEvent(
    userId: string,
    eventId: string,
    updateData: Partial<AsEvent>,
  ): Promise<Partial<AsEvent>> {
    const existingEvent = await this.db.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!existingEvent) {
      throw new BadRequestException('invalid event id');
    }

    const event = await this.db.event.update({
      where: { id: eventId, userId },
      data: updateData,
    });

    return event;
  }
}
