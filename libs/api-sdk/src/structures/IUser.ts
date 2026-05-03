export type IUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "RETAIL" | "ADMIN" | "SUPER_ADMIN";
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};
