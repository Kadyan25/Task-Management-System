import bcrypt from "bcrypt";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { HttpError } from "../../common/http-error";
import { prisma } from "../../lib/prisma";
import type { LoginInput, RegisterInput } from "./auth.schema";

type TokenPayload = JwtPayload & {
  sub: string;
  email: string;
  tokenType: "access" | "refresh";
};

type SafeUser = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

const SALT_ROUNDS = 10;

const mapSafeUser = (user: {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (
  payload: TokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
};

const createTokenPair = (user: { id: string; email: string }) => {
  const accessToken = signToken(
    { sub: user.id, email: user.email, tokenType: "access" },
    env.JWT_ACCESS_SECRET,
    env.ACCESS_TOKEN_EXPIRES_IN,
  );

  const refreshToken = signToken(
    { sub: user.id, email: user.email, tokenType: "refresh" },
    env.JWT_REFRESH_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (typeof payload === "string" || payload.tokenType !== "refresh") {
      throw new HttpError(401, "Invalid refresh token");
    }
    return payload as TokenPayload;
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new HttpError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const createdUser = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const { accessToken, refreshToken } = createTokenPair(createdUser);
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: createdUser.id },
      data: { refreshTokenHash },
    });

    return {
      user: mapSafeUser(createdUser),
      accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = createTokenPair(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: mapSafeUser(user),
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new HttpError(401, "Unauthorized");
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      throw new HttpError(401, "Unauthorized");
    }

    const { accessToken, refreshToken: newRefreshToken } = createTokenPair(user);
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: mapSafeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.user.update({
        where: { id: payload.sub },
        data: { refreshTokenHash: null },
      });
    } catch {
      // If token is invalid/expired we still return success and clear cookie client-side.
    }
  },
};
