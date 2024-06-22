import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
} from "@nostr-dev-kit/ndk";

import { z } from "zod";
import {
  getTag,
  getTags,
  slugify,
  removeDuplicates,
  CalendarEventSchema,
  CalendarSchema,
  RsvpSchema,
} from "@repo/utils";
import { nip19 } from "nostr-tools";
import { RsvpStatus, prisma } from "@repo/database";
import { EventSchema, ProfileSchema } from "@repo/utils";

export async function addEvent(rawEvent: NostrEvent) {
  try {
    console.log("At add event Raw", rawEvent);
    const event = EventSchema.parse(rawEvent);
    const { kind } = event;
    console.log("At add event", event);
    switch (kind) {
      case NDKKind.Metadata:
        return handleMetadataEvent(event);

      case 31923:
        return handleCalendarEvent(event);

      case 31925:
        return handleRsvpEvent(event);

      default:
        return null;
    }
  } catch (err) {
    console.log("Error adding event");
  }
}

type ParsedEvent = z.infer<typeof EventSchema>;

async function handleMetadataEvent(event: ParsedEvent) {
  const profile = ProfileSchema.parse(JSON.parse(event.content));
  console.log("Attempting to add", profile);
  const user = await prisma.user.upsert({
    where: {
      pubkey: event.pubkey,
    },
    create: {
      pubkey: event.pubkey,
      ...profile,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: event,
        },
      },
    },
    update: {
      ...profile,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: event,
        },
      },
    },
  });
  const isCalendar = CalendarSchema.safeParse(event);
  if (isCalendar.success) {
    await prisma.calendar.upsert({
      where: {
        pubkey: event.pubkey,
      },
      create: {
        pubkey: event.pubkey,
      },
      update: {
        pubkey: event.pubkey,
      },
    });
  }
  return user;
}
async function handleCalendarEvent(event: ParsedEvent) {
  const calendarEvent = CalendarEventSchema.parse(JSON.parse(event.content));

  const identifier = getTag(event.tags, "d", 1) as string;
  const hashtags = getTags(event.tags, "t", 1);
  const bech32 = nip19.naddrEncode({
    identifier: getTag(event.tags, "d", 1) as string,
    pubkey: event.pubkey,
    kind: event.kind ?? 31923,
  });

  const createdCalendarEvent = await prisma.calendarEvent.upsert({
    where: {
      pubkey_identifier: {
        pubkey: event.pubkey,
        identifier: identifier,
      },
    },
    create: {
      bech32: bech32,
      identifier: identifier,
      title: (getTag(event.tags, "title", 1) ??
        getTag(event.tags, "name", 1)) as string,
      image: getTag(event.tags, "image", 1),
      description: event.content,
      start: getTag(event.tags, "start", 1, parseInt) as number,
      end: isNaN(getTag(event.tags, "end", 1, parseInt) ?? NaN)
        ? undefined
        : getTag(event.tags, "end", 1, parseInt),
      location: getTag(event.tags, "location", 1),
      geohash: getTag(event.tags, "g", 1),
      pubkey: event.pubkey,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: event,
        },
      },
      tags: {
        connectOrCreate: removeDuplicates(hashtags).map((t) => ({
          where: {
            value: slugify(t),
          },
          create: {
            value: slugify(t),
            label: t,
          },
        })),
      },
    },
    update: {
      title: (getTag(event.tags, "title", 1) ??
        getTag(event.tags, "name", 1)) as string,
      image: getTag(event.tags, "image", 1),
      description: event.content,
      start: getTag(event.tags, "start", 1, parseInt) as number,
      end: isNaN(getTag(event.tags, "end", 1, parseInt) ?? NaN)
        ? undefined
        : getTag(event.tags, "end", 1, parseInt),
      location: getTag(event.tags, "location", 1),
      geohash: getTag(event.tags, "g", 1),
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: event,
        },
      },
      tags: {
        connectOrCreate: removeDuplicates(hashtags).map((t) => ({
          where: {
            value: slugify(t),
          },
          create: {
            value: slugify(t),
            label: t,
          },
        })),
      },
    },
  });

  return createdCalendarEvent;
}
async function handleRsvpEvent(event: ParsedEvent) {
  const rsvpEvent = RsvpSchema.parse(JSON.parse(event.content));

  const status = (getTag(event.tags, "status", 1) ??
    getTag(event.tags, "l", 1)) as "accepted" | "declined" | "tentative";
  const identifier = getTag(event.tags, "d", 1) as string;
  const a = getTag(event.tags, "a");
  const [key, address, relay] = a as [
    "a",
    `${31922 | 31923}:${string}:${string}`,
    string | undefined,
  ];
  const [kind, eventPubkey, eventIdentifier] = address.split(":");
  if (!kind || parseInt(kind) !== 31923) {
    throw new Error("Non Calendar event rsvp");
  } else if (eventPubkey === undefined || eventIdentifier === undefined) {
    throw new Error("Invalid event address");
  }
  const calendarEvent = await prisma.calendarEvent.findFirst({
    where: {
      pubkey: eventPubkey,
      identifier: eventIdentifier,
    },
  });
  if (!calendarEvent) {
    throw new Error("Unable to find event");
  }

  await prisma.event.upsert({
    where: {
      id: event.id,
    },
    create: event,
    update: event,
  });

  const newRsvpEvent = await prisma.rsvp.upsert({
    where: {
      pubkey_identifier: {
        pubkey: event.pubkey,
        identifier: identifier,
      },
    },
    create: {
      pubkey: event.pubkey,
      identifier: identifier,
      status:
        status === "accepted"
          ? RsvpStatus.ACTIVE
          : status === "tentative"
            ? RsvpStatus.TENTATIVE
            : RsvpStatus.INACTIVE,
      calendarEventPubkey: eventPubkey,
      calendarEventIdentifier: eventIdentifier,
      eventId: event.id,
    },
    update: {
      status:
        status === "accepted"
          ? RsvpStatus.ACTIVE
          : status === "tentative"
            ? RsvpStatus.TENTATIVE
            : RsvpStatus.INACTIVE,
      eventId: event.id,
      //   event: {
      //     connectOrCreate: {
      //       where: {
      //         id: event.id,
      //       },
      //       create: event,
      //     },
      //   },
    },
  });

  return newRsvpEvent;
}
