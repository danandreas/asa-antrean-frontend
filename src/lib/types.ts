export type Role = {
  id: number;
  code: "admin" | "user";
  name: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role?: Role;
};

export type Clinic = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
};

export type QueueStatus = "waiting" | "called" | "done" | "cancelled";

export type QueueTicket = {
  id: number;
  clinic_id: number;
  user_id: number;
  queue_number: number;
  status: QueueStatus;
  called_at: string | null;
  queue_date: string;
  clinic?: Clinic;
  user?: Pick<User, "id" | "name" | "email">;
};
