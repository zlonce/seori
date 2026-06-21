import client from "./client";

export interface SpecialDayResponse {
  id: number;
  date: string;
  name: string;
  recurring: boolean;
}

export const getSpecialDaysAPI = (year: number, month: number) =>
  client.get<SpecialDayResponse[]>("/special-days", { params: { year, month } }).then((r) => r.data);

export const createSpecialDayAPI = (date: string, name: string, recurring: boolean) =>
  client.post<SpecialDayResponse>("/special-days", { date, name, recurring }).then((r) => r.data);

export const deleteSpecialDayAPI = (id: number) =>
  client.delete(`/special-days/${id}`);
