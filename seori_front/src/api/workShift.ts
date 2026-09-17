import client from "./client";

export interface WorkShiftResponse {
  id: number;
  workDate: string;
  startTime: string | null;
  endTime: string | null;
  specialDay: boolean;
  regularMinutes: number;
  overtimeMinutes: number;
  regularWage: number;
  overtimeWage: number;
  totalWage: number;
}

export interface CreateWorkShiftRequest {
  workDate: string;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkShiftRequest {
  startTime: string;
  endTime: string;
}

export const getMyWorkShiftsAPI = (year: number, month: number) =>
  client.get<WorkShiftResponse[]>("/work-shifts/my", { params: { year, month } }).then((r) => r.data);

export const getStaffWorkShiftsAPI = (staffId: string, year: number, month: number) =>
  client.get<WorkShiftResponse[]>(`/work-shifts/staff/${staffId}`, { params: { year, month } }).then((r) => r.data);

export const createWorkShiftAPI = (data: CreateWorkShiftRequest) =>
  client.post<WorkShiftResponse>("/work-shifts", data).then((r) => r.data);

export const updateWorkShiftAPI = (id: number, data: UpdateWorkShiftRequest) =>
  client.put<WorkShiftResponse>(`/work-shifts/${id}`, data).then((r) => r.data);

export const deleteWorkShiftAPI = (id: number) =>
  client.delete(`/work-shifts/${id}`);
