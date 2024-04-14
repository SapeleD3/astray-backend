import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../commons/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  CreateOrderPayload,
  GetOrderResponse,
  GetOrdersFilter,
  OrderCheckInPayload,
  OrderCheckInResponse,
  PaymentRequestBody,
} from '../type';
import { Order } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { EmailService, OrderTicketTemplate } from '../../../commons';
import { compile } from 'handlebars';

@Injectable()
export class OrderApiService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentReference(
    payload: PaymentRequestBody,
  ): Promise<{ ref: string }> {
    const { amount, email } = payload;
    const paymentRef = uuidv4().toString();

    await this.db.payment.create({
      data: {
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
        ref: paymentRef,
        amount,
        email,
      },
    });

    return { ref: paymentRef };
  }

  async orderCheckIn(
    userId: string,
    payload: OrderCheckInPayload,
  ): Promise<OrderCheckInResponse> {
    const order = await this.db.order.findFirst({
      where: {
        userId,
        id: payload.orderId,
        status: 'SUCCESS',
      },
    });

    if (!order) {
      throw new BadRequestException('invalid order id');
    }

    let seatsRemaining = order.quantity - order.checkedIn;
    if (payload.quantity > seatsRemaining) {
      throw new BadRequestException(
        `invalid check in: number of seats remaing on order is ${seatsRemaining}`,
      );
    }
    seatsRemaining = seatsRemaining - payload.quantity;
    const isFullyCheckIn = seatsRemaining === 0;

    await this.db.order.update({
      data: {
        fullyCheckedIn: isFullyCheckIn,
        checkedIn: { increment: payload.quantity },
        updatedAt: dayjs().unix(),
      },
      where: { id: order.id },
    });

    return {
      checkIn: 'SUCCESSFUL',
      fullyCheckedIn: isFullyCheckIn,
      seatsRemaining: seatsRemaining,
    };
  }

  async createOrder(payload: CreateOrderPayload): Promise<any> {
    const [payment, ticket, existingOrder, event] = await Promise.all([
      this.db.payment.findFirst({
        where: { email: payload.email, ref: payload.reference },
      }),
      this.db.ticket.findFirst({
        where: { id: payload.ticket.id, eventId: payload.event },
      }),
      this.db.order.findFirst({
        where: {
          ref: payload.reference,
          ticketId: payload.ticket.id,
          status: 'SUCCESS',
        },
      }),
      this.db.event.findFirst({
        where: {
          id: payload.event,
        },
      }),
    ]);

    if (!ticket || existingOrder || !payment) {
      throw new BadRequestException('Order is invalid, please try again');
    }
    let order: Order | null = null;

    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMPQRSTXY', 7);
    const bookingId = nanoid(); // generate booking ID

    await this.db.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        data: {
          sold: { increment: payload.quantity },
          updatedAt: dayjs().unix(),
        },
        where: { id: payload.ticket.id },
      });

      if (updatedTicket.sold > updatedTicket.quantity) {
        throw new BadRequestException(
          'Order is quantity invalid, please check number of available tickets',
        );
      }

      if (updatedTicket.sold === updatedTicket.quantity) {
        await tx.ticket.update({
          data: {
            soldOut: true,
            updatedAt: dayjs().unix(),
          },
          where: { id: payload.ticket.id },
        });
      }

      await tx.payment.update({
        data: {
          status: 'SUCCESS',
          updatedAt: dayjs().unix(),
        },
        where: { email: payload.email, ref: payload.reference },
      });

      order = await tx.order.create({
        data: {
          bookingId,
          email: payload.email,
          quantity: payload.quantity,
          ref: payload.reference,
          total: payload.total,
          checkedIn: 0,
          fullyCheckedIn: false,
          paymentId: payment.id,
          ticketId: ticket.id,
          eventId: ticket?.eventId || payload.event,
          status: 'SUCCESS',
          userId: event?.userId, // owner of the event
        },
      });
    });

    const template = compile(OrderTicketTemplate);
    const templateData = {
      eventName: event?.name,
      bookingId: bookingId,
      total: payload.total,
      country: event?.country,
      state: event?.state,
      address: event?.address,
      ticket: ticket.name,
      quantity: payload.quantity,
      start: dayjs(event?.startDate).format('hh:mm A, DD MMMM YYYY.'),
    };

    // Send email of booking Id
    const mailer = new EmailService();
    await mailer.sendMail({
      to: payload.email,
      subject: 'Ticket Purchase',
      html: template(templateData),
    });

    return { order };
  }

  async getOrders(
    userId: string,
    filter: GetOrdersFilter,
  ): Promise<GetOrderResponse> {
    const whereQuery: any = {
      userId,
    };

    if (filter?.id) whereQuery['id'] = filter.id;
    if (filter?.bookingId) whereQuery['bookingId'] = filter.bookingId;
    if (filter?.eventId) whereQuery['eventId'] = filter.eventId;
    if (filter?.status) whereQuery['status'] = filter.status;

    const { limit, page } = filter;
    let totalOrders = 0;

    try {
      totalOrders = await this.db.order.count({
        where: whereQuery,
      });
    } catch (error) {
      return { orders: [], pages: 0, total: totalOrders, page, limit };
    }

    const pages = Math.ceil(totalOrders / limit);
    const offset = limit * (page - 1) || 0;

    const orders = await this.db.order.findMany({
      where: whereQuery,
      include: { Ticket: true, Payment: true },
      skip: offset,
      take: limit,
    });

    return { orders, pages, total: totalOrders, page, limit };
  }
}
