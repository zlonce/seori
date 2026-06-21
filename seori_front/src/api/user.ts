import client from "./client";

export type UserRole = "STAFF" | "MANAGER";

export interface StaffSummary {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  hourlyWage: number;
  overtimeWage: number;
  weeklyWorkDays: number;
}

export const getStaffListAPI = () =>
  client.get<StaffSummary[]>("/users/staff").then((r) => r.data);

export const updateStaffProfileAPI = (userId: string, data: { name: string; role: UserRole; hourlyWage: number; overtimeWage: number; weeklyWorkDays: number }) =>
  client.patch(`/users/${userId}/profile`, data);

export const createUserAPI = (data: {
  phone: string;
  name: string;
  role: string;
  hourlyWage: number;
  overtimeWage: number;
  weeklyWorkDays: number;
}) => client.post("/users", data);
