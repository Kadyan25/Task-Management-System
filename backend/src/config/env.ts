import { z } from "zod";

const durationUnits = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

const parseDurationMs = (input: string): number => {
  const match = input.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    throw new Error(`Invalid duration format: ${input}. Use patterns like 15m, 7d.`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase() as keyof typeof durationUnits;
  return value * durationUnits[unit];
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default("refreshToken"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = {
  ...parsed.data,
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS: parseDurationMs(parsed.data.REFRESH_TOKEN_EXPIRES_IN),
};
