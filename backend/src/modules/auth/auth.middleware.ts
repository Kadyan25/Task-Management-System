import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../../common/http-error";
import { env } from "../../config/env";
import type { AuthTokenPayload } from "./auth.types";

const getBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new HttpError(401, "Missing authorization header");
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Invalid authorization header format");
  }

  return token;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (typeof payload === "string" || payload.tokenType !== "access") {
      throw new HttpError(401, "Invalid access token");
    }

    const typedPayload = payload as AuthTokenPayload;
    req.user = {
      id: typedPayload.sub,
      email: typedPayload.email,
    };

    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
};
