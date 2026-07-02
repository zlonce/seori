import client from "./client";

export interface WorkRecordResponse {
  id: number;
  workDate: string;
  startTime: string;
  endTime: string;
  specialDay: boolean;
  regularMinutes: number;
  overtimeMinutes: number;
  regularWage: number;
  overtimeWage: number;
  totalWage: number;
}

export interface CreateWorkRecordRequest {
  workDate: string;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkRecordRequest {
  startTime: string;
  endTime: string;
}

export const getMyWorkRecordsAPI = (year: number, month: number) =>
  client.get<WorkRecordResponse[]>("/work-records/my", { params: { year, month } }).then((r) => r.data);

export const getStaffWorkRecordsAPI = (staffId: string, year: number, month: number) =>
  client.get<WorkRecordResponse[]>(`/work-records/staff/${staffId}`, { params: { year, month } }).then((r) => r.data);

export const createWorkRecordAPI = (data: CreateWorkRecordRequest) =>
  client.post<WorkRecordResponse>("/work-records", data).then((r) => r.data);

export const updateWorkRecordAPI = (id: number, data: UpdateWorkRecordRequest) =>
  client.put<WorkRecordResponse>(`/work-records/${id}`, data).then((r) => r.data);

export const deleteWorkRecordAPI = (id: number) =>
  client.delete(`/work-records/${id}`);
