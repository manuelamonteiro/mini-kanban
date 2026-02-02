import type { ApiCard, ApiEnvelope, Card } from "../types";
import api, { getAuthConfig, unwrapApiData } from "./api";
import { mapCardFromApi } from "./mappers";

export async function createCard(columnId: string, title: string, description?: string): Promise<Card> {
  const { data } = await api.post<ApiEnvelope<ApiCard>>(
    `/columns/${columnId}/cards`,
    { title, description },
    getAuthConfig()
  );

  return mapCardFromApi(unwrapApiData(data));
}

export async function updateCard(cardId: string, title?: string, description?: string): Promise<Card> {
  const body: { title?: string; description?: string } = {};
  if (title !== undefined) body.title = title;
  if (description !== undefined) body.description = description;

  const { data } = await api.put<ApiEnvelope<ApiCard>>(`/cards/${cardId}`, body, getAuthConfig());
  return mapCardFromApi(unwrapApiData(data));
}

export async function deleteCard(cardId: string): Promise<void> {
  await api.delete(`/cards/${cardId}`, getAuthConfig());
}

export async function moveCard(cardId: string, newColumnId: string, newPosition?: number): Promise<Card> {
  const { data } = await api.patch<ApiEnvelope<ApiCard>>(
    `/cards/${cardId}/move`,
    { newColumnId, newPosition },
    getAuthConfig()
  );

  return mapCardFromApi(unwrapApiData(data));
}
