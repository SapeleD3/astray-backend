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
