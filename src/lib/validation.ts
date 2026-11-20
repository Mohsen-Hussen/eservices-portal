import { z } from "zod";

/**
 * Validation messages are dictionary keys (see `errors` in the dictionaries),
 * so the same schema works for Arabic and English and is easy to unit-test.
 */
export type ErrorKey =
  | "required"
  | "minName"
  | "nationalId"
  | "email"
  | "mobile"
  | "futureDate"
  | "minDescription"
  | "attachmentsRequired"
  | "attachmentsMax"
  | "fileType"
  | "fileSize"
  | "declaration";

const msg = (key: ErrorKey) => ({ message: key });

export const cities = ["riyadh", "jeddah", "dammam", "makkah", "madinah"] as const;

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

/** Today's date as YYYY-MM-DD in local time. */
export function todayISO(now: Date = new Date()): string {
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export const applicantSchema = z.object({
  fullName: z.string().trim().min(1, msg("required")).min(3, msg("minName")),
  nationalId: z
    .string()
    .trim()
    .min(1, msg("required"))
    .regex(/^[12]\d{9}$/, msg("nationalId")),
  email: z
    .string()
    .trim()
    .min(1, msg("required"))
    .pipe(z.email(msg("email"))),
  mobile: z
    .string()
    .trim()
    .min(1, msg("required"))
    .regex(/^05\d{8}$/, msg("mobile")),
});

export const detailsSchema = z.object({
  entityName: z.string().trim().min(1, msg("required")),
  city: z.enum(cities, msg("required")),
  startDate: z
    .string()
    .min(1, msg("required"))
    .refine((value) => value >= todayISO(), msg("futureDate")),
  description: z.string().trim().min(1, msg("required")).min(20, msg("minDescription")),
});

export const attachmentSchema = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, msg("fileSize")),
  type: z.string().refine((type) => ACCEPTED_FILE_TYPES.includes(type), msg("fileType")),
});

export const attachmentsSchema = z.object({
  attachments: z
    .array(attachmentSchema)
    .min(1, msg("attachmentsRequired"))
    .max(MAX_FILES, msg("attachmentsMax")),
});

export const reviewSchema = z.object({
  declaration: z.literal(true, msg("declaration")),
});

export const applicationSchema = applicantSchema
  .extend(detailsSchema.shape)
  .extend(attachmentsSchema.shape)
  .extend(reviewSchema.shape);

export type ApplicationValues = z.infer<typeof applicationSchema>;
export type AttachmentMeta = z.infer<typeof attachmentSchema>;

/** Fields validated on each wizard step, in order. */
export const stepFields = [
  Object.keys(applicantSchema.shape),
  Object.keys(detailsSchema.shape),
  Object.keys(attachmentsSchema.shape),
  Object.keys(reviewSchema.shape),
] as (keyof ApplicationValues)[][];
