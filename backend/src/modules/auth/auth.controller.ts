import type { CookieOptions, Request, Response } from "express";
import { asyncHandler } from "../../common/async-handler";
import { HttpError } from "../../common/http-error";
import { env } from "../../config/env";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";
import { authService } from "./auth.service";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: 0,
  });
};

const readRefreshToken = (req: Request): string => {
  const body = refreshSchema.parse(req.body ?? {});
  const tokenFromCookie = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
  const token = tokenFromCookie ?? body.refreshToken;

  if (!token) {
    throw new HttpError(401, "Refresh token is required");
  }

  return token;
};

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);

  setRefreshCookie(res, result.refreshToken);

  res.status(201).json({
    message: "Registration successful",
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    message: "Login successful",
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = readRefreshToken(req);
  const result = await authService.refresh(refreshToken);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    message: "Token refreshed",
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
  const body = refreshSchema.parse(req.body ?? {});
  const refreshToken = tokenFromCookie ?? body.refreshToken;

  await authService.logout(refreshToken);
  clearRefreshCookie(res);

  res.status(200).json({ message: "Logout successful" });
});
