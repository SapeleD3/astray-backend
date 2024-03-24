import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../commons/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { CreateOrderPayload, PaymentRequestBody } from '../type';
import { Order } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { EmailService } from '../../../commons';

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

  async createOrder(payload: CreateOrderPayload): Promise<any> {
    const [payment, ticket, existingOrder] = await Promise.all([
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
    ]);

    if (!ticket || existingOrder || !payment) {
      throw new BadRequestException('Order is invalid, please try again');
    }
    let order: Order | null = null;

    const nanoid = customAlphabet('1234567890abcdefghijklmnpqrstxy', 7);
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
        },
      });
    });

    // Send email of booking Id
    const mailer = new EmailService();
    await mailer.sendMail({
      to: payload.email,
      subject: 'Ticket Purchase',
      html: `<h1>${bookingId}</h1>`,
    });

    return { order };
  }
}
