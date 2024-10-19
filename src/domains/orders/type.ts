export type PaymentRequestBody = {
  amount: number;
  quantity: number;
  email: string;
  ticketId: string;
};

export type VerifyPaymentRequestBody = {
  ref: string;
  ticketId: string;
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

export type GetPaymentFilter = {
  ticketId?: string;
  id?: string;
  page: number;
  limit: number;
  status?: string;
};

export type GetOrderResponse = {
  pages: number;
  total: number;
  page: number;
  limit: number;
  orders: any[];
};

export type GetPaymentResponse = {
  pages: number;
  total: number;
  page: number;
  limit: number;
  payment: any[];
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
