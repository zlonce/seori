import client from "./client";

export type WeekStatus = "VOTING" | "CLOSED" | "CONFIRMED";

export interface ScheduleWeek {
  id: number;
  weekStartDate: string;
  votingDeadline: string;
  status: WeekStatus;
  businessDays: boolean[];
}

export interface ScheduleVote {
  userId: string;
  userName: string;
  availableDate: string;
}

export interface ScheduleAssignment {
  userId: string;
  userName: string;
  workDate: string;
}

export interface ScheduleWeekDetail extends ScheduleWeek {
  votes: ScheduleVote[];
  assignments: ScheduleAssignment[];
}

export const getWeeksAPI = () =>
  client.get<ScheduleWeek[]>("/schedule").then((r) => r.data);

export const getWeekDetailAPI = (weekId: number) =>
  client.get<ScheduleWeekDetail>(`/schedule/${weekId}`).then((r) => r.data);

export const createWeekAPI = (weekStartDate: string, businessDays: boolean[], votingDeadline: string) => {
  const normalized = votingDeadline.length === 16 ? votingDeadline + ":00" : votingDeadline;
  return client.post<ScheduleWeek>("/schedule", { weekStartDate, businessDays, votingDeadline: normalized }).then((r) => r.data);
};

export const updateBusinessDaysAPI = (weekId: number, businessDays: boolean[]) =>
  client.patch<ScheduleWeek>(`/schedule/${weekId}/business-days`, { businessDays }).then((r) => r.data);

export const closeVotingAPI = (weekId: number) =>
  client.patch<ScheduleWeek>(`/schedule/${weekId}/close`).then((r) => r.data);

export const confirmScheduleAPI = (
  weekId: number,
  assignments: { userId: string; workDate: string }[]
) =>
  client.put<ScheduleWeek>(`/schedule/${weekId}/confirm`, { assignments }).then((r) => r.data);

export const getVotesAPI = (weekId: number) =>
  client.get<ScheduleVote[]>(`/schedule/${weekId}/votes`).then((r) => r.data);

export const saveVotesAPI = (weekId: number, availableDates: string[]) =>
  client.put(`/schedule/${weekId}/votes`, { availableDates });

export const getAssignmentsAPI = (weekId: number) =>
  client.get<ScheduleAssignment[]>(`/schedule/${weekId}/assignments`).then((r) => r.data);
