import { z } from 'zod';

// Parse a boolean from an env string. Plain `z.coerce.boolean()` is a trap —
// it treats the string 'false' as truthy. This only accepts a literal 'true'.
const envBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return defaultValue;
  }, z.boolean());

// The single source of truth for environment shape. Validated once at startup;
// a missing or malformed variable stops boot rather than failing at runtime
// (architecture.md §12).
const configObjectSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string().min(1),
  DATABASE_SYNCHRONIZE: envBoolean(false),
  DATABASE_LOGGING: envBoolean(false),
  // Managed Postgres providers (Supabase, RDS, etc.) require TLS; local Docker
  // Postgres does not speak TLS at all, so this must stay opt-in per environment.
  DATABASE_SSL: envBoolean(false),

  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  // How often the API delivers pending outbox messages to the in-process
  // consumers. 0 disables the loop (tests run with NODE_ENV=test, also disabled).
  OUTBOX_RELAY_INTERVAL_MS: z.coerce.number().int().nonnegative().default(5000),

  // Notification delivery. Both optional: without credentials the logger
  // transport records the intent instead of sending (the dev default).
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // Onboarding automation (n8n). The shared secret signs every webhook the HRMS
  // sends and authenticates the workflow's callback; without it "Run automation"
  // stays switched off. The callback address sent to the workflow is built from
  // PUBLIC_API_URL (below).
  ONBOARDING_AUTOMATION_SECRET: z
    .string()
    .min(32, 'ONBOARDING_AUTOMATION_SECRET must be at least 32 characters')
    .optional(),

  // A weak JWT secret is a security hole; require real entropy.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),

  // Public form links are bearer credentials for anonymous candidates — long
  // enough to run a hiring cycle, short enough to expire on their own.
  FORM_LINK_TTL_DAYS: z.coerce.number().int().positive().default(30),
  // Sliding-window limits for the anonymous form surface (per form + IP, ten
  // minutes). Deliberately blunt abuse protection, tunable per environment.
  FORM_SUBMIT_LIMIT_PER_10_MIN: z.coerce.number().int().positive().default(10),
  FORM_UPLOAD_LIMIT_PER_10_MIN: z.coerce.number().int().positive().default(30),

  // Sliding-window limits for the public sign-in/sign-up mutations. Login is
  // limited per email (password guessing) and per client address (spraying
  // many emails); the address limit is generous because staff can share an
  // office connection.
  LOGIN_LIMIT_PER_EMAIL_PER_15_MIN: z.coerce.number().int().positive().default(10),
  LOGIN_LIMIT_PER_ADDRESS_PER_15_MIN: z.coerce.number().int().positive().default(50),
  SIGNUP_LIMIT_PER_ADDRESS_PER_HOUR: z.coerce.number().int().positive().default(5),

  // Comma-separated browser origins allowed to call the API with credentials,
  // e.g. "https://hrms.tethrhq.com". Required in production; when unset in
  // development any origin is allowed so the Vite dev server just works.
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((origin) => origin.trim().replace(/\/+$/, ''))
            .filter((origin) => origin.length > 0)
        : undefined,
    ),

  GRAPHQL_PLAYGROUND: envBoolean(false),

  // Object storage. 'supabase' is the real driver; 'local' writes to disk under
  // the API's working directory and exists so development can exercise the real
  // upload/download flow without a bucket — it is refused in production.
  STORAGE_DRIVER: z.enum(['local', 'supabase']).default('local'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('hrms-documents'),
  STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  // Absolute base the browser can reach the API on; needed by the local
  // storage driver to mint links. Falls back to http://localhost:${PORT}.
  PUBLIC_API_URL: z.string().url().optional(),

  // Employer identity printed on generated payslip PDFs.
  PDF_EMPLOYER_NAME: z.string().min(1).default('Tethr Pvt. Ltd.'),
  PDF_EMPLOYER_LOCATION: z.string().min(1).default('Islamabad, Pakistan'),
});

const requireSupabaseStorage = (
  config: z.infer<typeof configObjectSchema>,
  context: z.RefinementCtx,
) => {
  if (config.STORAGE_DRIVER === 'local' && config.NODE_ENV === 'production') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['STORAGE_DRIVER'],
      message: 'local storage is development-only; set STORAGE_DRIVER=supabase in production',
    });
  }
  if (config.STORAGE_DRIVER === 'supabase') {
    for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const) {
      if (!config[key]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when STORAGE_DRIVER=supabase`,
        });
      }
    }
  }
};

const requireProductionCors = (
  config: z.infer<typeof configObjectSchema>,
  context: z.RefinementCtx,
) => {
  if (config.NODE_ENV === 'production' && (!config.CORS_ORIGINS || config.CORS_ORIGINS.length === 0)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ORIGINS'],
      message: 'CORS_ORIGINS is required in production (comma-separated web app origins)',
    });
  }
};

const configSchema = configObjectSchema.superRefine((config, context) => {
  requireSupabaseStorage(config, context);
  requireProductionCors(config, context);
});

export type AppConfig = z.infer<typeof configObjectSchema>;

// Validate a raw environment. Throws a single, readable error listing every
// problem — call this exactly once, at startup.
export const loadConfig = (source: NodeJS.ProcessEnv = process.env): AppConfig => {
  const parsed = configSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
};
