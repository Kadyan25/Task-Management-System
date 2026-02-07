export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = LoginResponse;

export type RefreshResponse = {
  message: string;
  accessToken: string;
};
