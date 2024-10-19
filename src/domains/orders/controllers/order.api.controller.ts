import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiGroup, RouteTag } from '../../../commons/enums';
import { OrderApiService } from '../services';
import { generatePaymentRefDTO, verifyPaymentRefDTO } from './dto';
import {
  CreateOrderPayload,
  GetOrderResponse,
  GetPaymentResponse,
  OrderCheckInPayload,
  OrderCheckInResponse,
} from '../type';
import { AuthGuard } from '../../../commons/gaurds/user.authentication.guard';
import { AuthGuardRequest } from '../../../commons';

@Controller({
  path: `${RouteTag.API}/${ApiGroup.Order}`,
})
export class OrderApiController {
  constructor(private readonly orderApiService: OrderApiService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  async orderTicket(
    @Body() createOrderPayload: CreateOrderPayload,
  ): Promise<[]> {
    const order = this.orderApiService.createOrder(createOrderPayload);
    return order;
  }

  @Post('/reference')
  @HttpCode(HttpStatus.OK)
  async createPaymentReference(
    @Body() createPaymentRefPayload: generatePaymentRefDTO,
  ): Promise<{ ref: string }> {
    const ref = this.orderApiService.createPaymentReference({
      amount: createPaymentRefPayload.amount,
      email: createPaymentRefPayload.email,
      ticketId: createPaymentRefPayload.ticketId,
      quantity: createPaymentRefPayload.quantity,
    });
    return ref;
  }
}

@UseGuards(AuthGuard)
@Controller({
  path: `${RouteTag.API}/auth/${ApiGroup.Order}`,
})
export class AuthOrderApiController {
  constructor(private readonly orderApiService: OrderApiService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Request() request: AuthGuardRequest,
    @Query('id') id?: string,
    @Query('bookingId') bookingId?: string,
    @Query('eventId') eventId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<GetOrderResponse> {
    const filter = {
      id,
      page: page || 1,
      limit: limit || 10,
      bookingId,
      status,
      eventId,
    };
    const orders = await this.orderApiService.getOrders(request.id, filter);
    return orders;
  }

  @Get('/payments')
  @HttpCode(HttpStatus.OK)
  async getPaymentByTicketId(
    @Request() request: AuthGuardRequest,
    @Query('ticketId') ticketId: string,
    @Query('id') id?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<GetPaymentResponse> {
    const filter = {
      ticketId,
      id,
      page: page || 1,
      limit: limit || 10,
      status,
    };

    const payment = await this.orderApiService.getPayments(request.id, filter);
    return payment;
  }

  @Post('/check-in')
  @HttpCode(HttpStatus.OK)
  async orderCheckIn(
    @Request() request: AuthGuardRequest,
    @Body() orderCheckInPayload: OrderCheckInPayload,
  ): Promise<OrderCheckInResponse> {
    const response = this.orderApiService.orderCheckIn(
      request.id,
      orderCheckInPayload,
    );

    return response;
  }

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  async createPaymentReference(
    @Body() verifyPaymentRefPayload: verifyPaymentRefDTO,
  ): Promise<{ message: string; status: string }> {
    const ref = this.orderApiService.verifyPaymentReference({
      ticketId: verifyPaymentRefPayload.ticketId,
      ref: verifyPaymentRefPayload.ref,
    });
    return ref;
  }
}
