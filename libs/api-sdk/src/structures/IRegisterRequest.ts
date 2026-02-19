export type IRegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "RETAIL";
};
