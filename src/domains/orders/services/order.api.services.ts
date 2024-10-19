import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../commons/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  CreateOrderPayload,
  GetOrderResponse,
  GetOrdersFilter,
  GetPaymentFilter,
  GetPaymentResponse,
  OrderCheckInPayload,
  OrderCheckInResponse,
  PaymentRequestBody,
  VerifyPaymentRequestBody,
} from '../type';
import { Order } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import {
  EmailService,
  OrderTicketTemplate,
  eventOwnerTemplate,
} from '../../../commons';
import { compile } from 'handlebars';
import QRCode from 'qrcode';
import { Paystack } from '../../../providers';

@Injectable()
export class OrderApiService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
    private readonly paystack: Paystack,
  ) {}

  async createPaymentReference(
    payload: PaymentRequestBody,
  ): Promise<{ ref: string }> {
    const { amount, email, ticketId, quantity } = payload;
    const ticket = await this.db.ticket.findFirst({ where: { id: ticketId } });
    const newTotal = (ticket?.sold || 0) + quantity;
    const ticketQuantity = ticket?.quantity as number;

    if (newTotal > ticketQuantity) {
      throw new BadRequestException(
        'Order is quantity invalid, please check number of available tickets',
      );
    }

    const paymentRef = uuidv4().toString();

    await this.db.payment.create({
      data: {
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
        ref: paymentRef,
        amount,
        email,
        quantity,
        ticketId,
      },
    });

    return { ref: paymentRef };
  }

  async verifyPaymentReference(
    payload: VerifyPaymentRequestBody,
  ): Promise<{ message: string; status: string }> {
    const { ticketId, ref } = payload;
    const ticket = await this.db.ticket.findFirst({ where: { id: ticketId } });

    if (!ticket) {
      throw new BadRequestException('TicketId is invalid, please try again');
    }

    const [event, payment] = await Promise.all([
      this.db.event.findFirst({
        where: {
          id: ticket?.eventId || '',
        },
      }),
      this.db.payment.findFirst({ where: { ticketId: ticketId, ref: ref } }),
    ]);

    if (!event || !payment) {
      throw new BadRequestException('TicketId is invalid, please try again');
    }

    // VERIFY ORDER
    const paymentverification = await this.paystack.verifyPayment(ref);
    const is_verified = paymentverification.status === 'success';

    if (!is_verified) {
      return { message: 'Order still pending', status: payment.status };
    }

    let order: Order | null = null;
    const user = await this.db.user.findFirst({
      where: { id: event?.userId || '' },
    });

    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMPQRSTXY', 7);
    const bookingId = nanoid(); // generate booking ID

    await this.db.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        data: {
          sold: { increment: payment.quantity || 0 },
          updatedAt: dayjs().unix(),
        },
        where: { id: ticketId },
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
          where: { id: ticketId },
        });
      }

      await tx.payment.update({
        data: {
          status: 'SUCCESS',
          updatedAt: dayjs().unix(),
        },
        where: { email: payment.email, ref: ref },
      });

      order = await tx.order.create({
        data: {
          bookingId,
          email: payment.email,
          quantity: payment.quantity || 0,
          ref: ref,
          total: payment.amount,
          checkedIn: 0,
          fullyCheckedIn: false,
          paymentId: payment.id,
          ticketId: ticket.id,
          eventId: ticket?.eventId || event.id,
          status: 'SUCCESS',
          userId: event?.userId, // owner of the event
        },
      });
    });

    const template = compile(OrderTicketTemplate);
    const codeUrl = await QRCode.toDataURL(String(bookingId));

    const templateData = {
      eventName: event?.name,
      bookingId: bookingId,
      total: payment.amount,
      country: event?.country,
      state: event?.state,
      address: event?.address,
      ticket: ticket.name,
      quantity: payment.quantity,
      start: dayjs(event?.startDate).format('hh:mm A, DD MMMM YYYY.'),
      qrCode: codeUrl,
    };

    // Send email of booking Id
    const mailer = new EmailService();
    await mailer.sendMail({
      to: payment.email,
      subject: 'Ticket Purchase',
      html: template(templateData),
      attachment: [
        {
          filename: 'ticketQrCode.png',
          path: codeUrl,
          cid: 'qrcode', //same cid value as in the html img src
        },
      ],
    });

    if (user?.email) {
      const ownerTemplate = compile(eventOwnerTemplate);

      const ownerTemplateData = {
        name: user?.fullName,
        eventName: event?.name,
        total: payment.amount,
        ticket: ticket.name,
        quantity: payment.quantity,
      };

      await mailer.sendMail({
        to: user.email,
        subject: 'NEW!! Ticket Sale',
        html: ownerTemplate(ownerTemplateData),
      });
    }

    return { message: 'Payment successful', status: 'SUCCESS' };
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

    if (!ticket || existingOrder || !payment || !event?.userId) {
      throw new BadRequestException('Order is invalid, please try again');
    }
    let order: Order | null = null;
    const user = await this.db.user.findFirst({
      where: { id: event?.userId },
    });

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
    const codeUrl = await QRCode.toDataURL(String(bookingId));

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
      qrCode: codeUrl,
    };

    // Send email of booking Id
    const mailer = new EmailService();
    await mailer.sendMail({
      to: payload.email,
      subject: 'Ticket Purchase',
      html: template(templateData),
      attachment: [
        {
          filename: 'ticketQrCode.png',
          path: codeUrl,
          cid: 'qrcode', //same cid value as in the html img src
        },
      ],
    });

    if (user?.email) {
      const ownerTemplate = compile(eventOwnerTemplate);

      const ownerTemplateData = {
        name: user?.fullName,
        eventName: event?.name,
        total: payload.total,
        ticket: ticket.name,
        quantity: payload.quantity,
      };

      await mailer.sendMail({
        to: user.email,
        subject: 'NEW!! Ticket Sale',
        html: ownerTemplate(ownerTemplateData),
      });
    }

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

  async getPayments(filter: GetPaymentFilter): Promise<GetPaymentResponse> {
    if (!filter.ticketId) {
      throw new BadRequestException(
        'Ticket ID is required for getting payments',
      );
    }
    const whereQuery: any = { ticketId: filter.ticketId };

    if (filter?.id) whereQuery['id'] = filter.id;
    if (filter?.status) whereQuery['status'] = filter.status;

    const { limit, page } = filter;
    let totalPayments = 0;

    console.log('where: ', whereQuery);

    try {
      totalPayments = await this.db.payment.count({
        where: whereQuery,
      });
    } catch (error) {
      return { payment: [], pages: 0, total: totalPayments, page, limit };
    }

    const pages = Math.ceil(totalPayments / limit);
    const offset = limit * (page - 1) || 0;

    const payment = await this.db.payment.findMany({
      where: whereQuery,
      skip: offset,
      take: limit,
    });

    return { payment, pages, total: totalPayments, page, limit };
  }
}
