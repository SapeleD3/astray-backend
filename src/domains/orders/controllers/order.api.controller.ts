import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { ApiGroup, RouteTag } from '../../../commons/enums';
import { OrderApiService } from '../services';
import { generatePasswordRefDTO } from './dto';
import { CreateOrderPayload } from '../type';

@Controller({
  path: `${RouteTag.API}/${ApiGroup.Order}`,
})
export class OrderApiController {
  constructor(private readonly orderApiService: OrderApiService) {}

  @Post('/')
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
    @Body() createPaymentRefPayload: generatePasswordRefDTO,
  ): Promise<{ ref: string }> {
    const ref = this.orderApiService.createPaymentReference({
      amount: createPaymentRefPayload.amount,
      email: createPaymentRefPayload.email,
    });
    return ref;
  }
}
