import client from "./client";

export type UserRole = "STAFF" | "MANAGER";

export interface Staff {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  hourlyWage: number;
  overtimeWage: number;
}

export const getStaffListAPI = () =>
  client.get<Staff[]>("/users/staff").then((r) => r.data);

export interface StaffSummary {
  userId: string;
  name: string;
}

export const getStaffSummariesAPI = () =>
  client.get<StaffSummary[]>("/users/staff/summary").then((r) => r.data);

export const updateStaffProfileAPI = (
  userId: string,
  data: { name: string; role: UserRole; hourlyWage: number; overtimeWage: number; password?: string },
) => client.patch(`/users/${userId}/profile`, data);

export const createUserAPI = (data: {
  phone: string;
  name: string;
  role: UserRole;
  hourlyWage: number;
  overtimeWage: number;
  password: string;
}) => client.post("/users", data);
