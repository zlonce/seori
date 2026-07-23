import client from "./client";

export interface NoticeSummary {
  id: number;
  title: string;
  updatedAt: string;
}

export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getNoticesAPI = () =>
  client.get<NoticeSummary[]>("/notice").then((r) => r.data);

export const getNoticeAPI = (id: number) =>
  client.get<NoticeDetail>(`/notice/${id}`).then((r) => r.data);

export const createNoticeAPI = (title: string, content: string) =>
  client.post<NoticeDetail>("/notice", { title, content }).then((r) => r.data);

export const updateNoticeAPI = (id: number, title: string, content: string) =>
  client.put<NoticeDetail>(`/notice/${id}`, { title, content }).then((r) => r.data);

export const deleteNoticeAPI = (id: number) =>
  client.delete(`/notice/${id}`);
