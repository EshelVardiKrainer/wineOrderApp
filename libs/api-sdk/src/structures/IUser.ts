export type IUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "RETAIL" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};
