export type PaymentRequestBody = {
  amount: number;
  email: string;
};

export type OrderTicket = {
  id: string;
  name: string;
  price: number;
  soldOut: boolean;
};

export type CreateOrderPayload = {
  email: string;
  event: string;
  quantity: number;
  reference: string;
  ticket: OrderTicket;
  total: number;
};

export type GetOrdersFilter = {
  id?: string;
  bookingId?: string;
  eventId?: string;
  status?: string;
  page: number;
  limit: number;
};

export type GetOrderResponse = {
  pages: number;
  total: number;
  page: number;
  limit: number;
  orders: any[];
};

export type OrderCheckInPayload = {
  orderId: string;
  quantity: number;
};

export type OrderCheckInResponse = {
  checkIn: string;
  fullyCheckedIn: boolean;
  seatsRemaining: number;
};
