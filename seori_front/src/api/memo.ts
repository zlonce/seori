import client from "./client";

export interface MemoItem {
  id: number;
  text: string;
  done: boolean;
}

export const getMemosAPI = () =>
  client.get<MemoItem[]>("/memo").then((r) => r.data);

export const createMemoAPI = (text: string) =>
  client.post<MemoItem>("/memo", { text }).then((r) => r.data);

export const toggleMemoAPI = (id: number) =>
  client.patch<MemoItem>(`/memo/${id}/done`).then((r) => r.data);

export const deleteMemoAPI = (id: number) =>
  client.delete(`/memo/${id}`);
