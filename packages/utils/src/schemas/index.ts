import { z } from "zod";
import { getTag } from "../utils";

export const EventIdSchema = z.string().regex(/^[0-9a-f]{64}$/);
export const PubkeySchema = z.string().regex(/^[0-9a-f]{64}$/);
export const EventSchema = z.object({
  id: EventIdSchema,
  kind: z.number().int().nonnegative(),
  pubkey: PubkeySchema,
  tags: z.string().array().array(),
  content: z.string(),
  created_at: z.number(),
  sig: z.string(),
});

export const ProfileSchema = z.object({
  name: z.string(),
  picture: z.string().nullish(),
  about: z.string().nullish(),
  banner: z.string().nullish(),
  nip05: z.string().nullish(),
  lud16: z.string().nullish(),
  lud06: z.string().nullish(),
});

export const CalendarEventSchema = z.object({
  content: z.string().nullish(),
  tags: z
    .array(z.string())
    .array()
    .refine(
      (tags) => {
        const hasDTag = tags.find((t) => t[0] === "d");
        const title =
          tags.find((t) => t[0] === "title") ??
          tags.find((t) => t[0] === "name");
        const start = getTag(tags, "start", 1, parseInt);
        const end = getTag(tags, "end", 1, parseInt);

        return !!(
          hasDTag &&
          title &&
          start &&
          !isNaN(start) &&
          start < 2147483647 &&
          (!end || !isNaN(end))
        );
      },
      {
        message: "Missing needed tags",
      },
    ),
});
export const RsvpSchema = z.object({
  content: z.string().nullish(),
  tags: z
    .array(z.string())
    .array()
    .refine(
      (tags) => {
        const hasDTag = tags.find((t) => t[0] === "d");
        const a = getTag(tags, "a", 1);
        if (!a) return false;
        const aParts = a.split(":");
        const status = getTag(tags, "status", 1);
        const statusOptions = ["accepted", "declined", "tentative"];
        return !!(
          hasDTag &&
          aParts.length === 3 &&
          status &&
          statusOptions.includes(status)
        );
      },
      {
        message: "Missing needed tags",
      },
    ),
});

export const CalendarSchema = z.object({
  content: z.string().refine((content) => {
    const contentSchema = z.object({
      name: z.string(),
      type: z.string().refine((s) => s === "calendar"),
    });
    const parseOutcome = contentSchema.safeParse(JSON.parse(content));
    return parseOutcome.success;
  }),
});

export const ArticleEventSchema = z.object({
  content: z.string(),
  tags: z
    .array(z.string())
    .array()
    .refine(
      (tags) => {
        const hasDTag = tags.find((t) => t[0] === "d");
        const title = tags.find((t) => t[0] === "title");
        return !!(hasDTag && title);
      },
      {
        message: "Missing needed tags",
      },
    ),
});

export const VideoEventSchema = z.object({
  content: z.string().nullish(),
  tags: z
    .array(z.string())
    .array()
    .refine(
      (tags) => {
        const hasDTag = tags.find((t) => t[0] === "d");
        const title = tags.find((t) => t[0] === "title");
        const url = tags.find((t) => t[0] === "url");
        return !!(hasDTag && title && url);
      },
      {
        message: "Missing needed tags",
      },
    ),
});
