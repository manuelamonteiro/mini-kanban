export type Id = string;
export type ISODateString = string;

export type ApiErrorDetail = {
  message: string;
  path?: string;
};

export type ApiError = {
  message: string;
  type?: string;
  details?: ApiErrorDetail[];
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: ApiError | null;
};

export type ApiUser = {
  id: Id | number;
  name?: string | null;
  email: string;
};

export type ApiAuthResponse = {
  user: ApiUser;
  accessToken: string;
};

export type ApiCard = {
  id: Id | number;
  columnId: Id | number;
  title: string;
  description?: string | null;
  position: number;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type ApiColumn = {
  id: Id | number;
  name: string;
  position: number;
  cards: ApiCard[];
};

export type ApiBoardSummary = {
  id: Id | number;
  name: string;
  createdAt?: ISODateString;
};

export type ApiBoard = ApiBoardSummary & {
  columns: ApiColumn[];
};

export type User = {
  id: Id;
  name?: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type AuthTokens = {
  accessToken: string;
};

export type Card = {
  id: Id;
  columnId: Id;
  title: string;
  description: string;
  position: number;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type Column = {
  id: Id;
  name: string;
  position: number;
  cards: Card[];
};

export type BoardSummary = {
  id: Id;
  name: string;
  createdAt?: ISODateString;
};

export type Board = BoardSummary & {
  columns: Column[];
};
