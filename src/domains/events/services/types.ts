export type EventTicketPayload = {
  name: string;
  quantity: number;
  price: number;
  sold: number;
};

export type EventCreationPayload = {
  address: string;
  category: string;
  country: string;
  description: string;
  endDate: string;
  name: string;
  startDate: string;
  state: string;
  image: string;
  tickets: EventTicketPayload[];
};

export type EventCreationResponse = {
  eventId: string;
};

export type SeedEventCategoryResponse = {
  successful: boolean;
};

export type EventCategoryResponse = {
  id: string;
  name: string;
};

export type GetEventsFilter = {
  id?: string;
  page: number;
  limit: number;
  name?: string;
  status?: string;
  state?: string;
  country?: string;
};

export type UnauthEventTicketResponse = {
  name: string;
  price: number;
  soldOut: boolean;
};

export type UnauthEvents = {
  address: string;
  image: string;
  name: string;
  startDate: string;
  endDate: string;
  country: string;
  state: string;
  description: string;
  tickets: UnauthEventTicketResponse[];
};

export type UnauthEventResponse = {
  pages: number;
  total: number;
  page: number;
  limit: number;
  events: UnauthEvents[];
};
