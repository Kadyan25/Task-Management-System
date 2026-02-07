import type { JwtPayload } from "jsonwebtoken";

export type JwtTokenType = "access" | "refresh";

export type AuthTokenPayload = JwtPayload & {
  sub: string;
  email: string;
  tokenType: JwtTokenType;
};

export type AuthUser = {
  id: string;
  email: string;
};
