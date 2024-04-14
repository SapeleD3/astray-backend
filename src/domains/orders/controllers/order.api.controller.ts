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
import { generatePasswordRefDTO } from './dto';
import {
  CreateOrderPayload,
  GetOrderResponse,
  OrderCheckInPayload,
  OrderCheckInResponse,
} from '../type';
import { AuthGuard } from '../../../commons/gaurds/user.authentication.guard';
import { AuthGuardRequest } from '../../../commons';

@UseGuards(AuthGuard)
@Controller({
  path: `${RouteTag.API}/${ApiGroup.Order}`,
})
export class OrderApiController {
  constructor(private readonly orderApiService: OrderApiService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  async orderTicket(
    @Request() request: AuthGuardRequest,
    @Body() createOrderPayload: CreateOrderPayload,
  ): Promise<[]> {
    const order = this.orderApiService.createOrder(
      request.id,
      createOrderPayload,
    );
    return order;
  }

  @Post('/reference')
  @HttpCode(HttpStatus.OK)
  async createPaymentReference(
    @Request() request: AuthGuardRequest,
    @Body() createPaymentRefPayload: generatePasswordRefDTO,
  ): Promise<{ ref: string }> {
    const ref = this.orderApiService.createPaymentReference(request.id, {
      amount: createPaymentRefPayload.amount,
      email: createPaymentRefPayload.email,
    });
    return ref;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Request() request: AuthGuardRequest,
    @Query('id') id?: string,
    @Query('bookingId') bookingId?: string,
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
    };
    const orders = await this.orderApiService.getOrders(request.id, filter);
    return orders;
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
}
