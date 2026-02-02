import type {
  ApiAuthResponse,
  ApiBoard,
  ApiBoardSummary,
  ApiCard,
  ApiColumn,
  AuthResponse,
  Board,
  BoardSummary,
  Card,
  Column,
  User,
} from "../types";

export function mapUserFromApi(user: ApiAuthResponse["user"]): User {
  return {
    id: String(user.id),
    name: user.name ?? undefined,
    email: user.email,
  };
}

export function mapAuthFromApi(payload: ApiAuthResponse): AuthResponse {
  return {
    user: mapUserFromApi(payload.user),
    accessToken: payload.accessToken,
  };
}

export function mapCardFromApi(card: ApiCard): Card {
  return {
    id: String(card.id),
    columnId: String(card.columnId),
    title: card.title ?? "",
    description: card.description ?? "",
    position: card.position ?? 0,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

export function mapColumnFromApi(column: ApiColumn): Column {
  return {
    id: String(column.id),
    name: column.name ?? "",
    position: column.position ?? 0,
    cards: Array.isArray(column.cards) ? column.cards.map(mapCardFromApi) : [],
  };
}

export function mapBoardSummaryFromApi(board: ApiBoardSummary): BoardSummary {
  return {
    id: String(board.id),
    name: board.name ?? "",
    createdAt: board.createdAt,
  };
}

export function mapBoardFromApi(board: ApiBoard): Board {
  return {
    ...mapBoardSummaryFromApi(board),
    columns: Array.isArray(board.columns) ? board.columns.map(mapColumnFromApi) : [],
  };
}
