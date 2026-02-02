import type {
  ApiBoard,
  ApiBoardSummary,
  ApiColumn,
  ApiEnvelope,
  Board,
  BoardSummary,
  Column,
} from "../types";
import api, { getAuthConfig, unwrapApiData } from "./api";
import { mapBoardFromApi, mapBoardSummaryFromApi, mapColumnFromApi } from "./mappers";

export async function fetchBoards(): Promise<BoardSummary[]> {
  const { data } = await api.get<ApiEnvelope<ApiBoardSummary[]>>("/boards", getAuthConfig());
  return unwrapApiData(data).map(mapBoardSummaryFromApi);
}

export async function createBoard(name: string): Promise<BoardSummary> {
  const { data } = await api.post<ApiEnvelope<ApiBoardSummary>>("/boards", { name }, getAuthConfig());
  return mapBoardSummaryFromApi(unwrapApiData(data));
}

export async function fetchBoard(boardId: string): Promise<Board> {
  const { data } = await api.get<ApiEnvelope<ApiBoard>>(`/boards/${boardId}`, getAuthConfig());
  return mapBoardFromApi(unwrapApiData(data));
}

export async function deleteBoard(boardId: string): Promise<void> {
  await api.delete(`/boards/${boardId}`, getAuthConfig());
}

export async function createColumn(boardId: string, name: string, position?: number): Promise<Column> {
  const { data } = await api.post<ApiEnvelope<ApiColumn>>(
    `/boards/${boardId}/columns`,
    { name, position },
    getAuthConfig()
  );

  return mapColumnFromApi(unwrapApiData(data));
}
