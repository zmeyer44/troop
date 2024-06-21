import { Event, nip19 } from "nostr-tools";
import { getTag, getTags, slugify, removeDuplicates } from "../utils";
import { CalendarEventSchema, CalendarSchema, EventSchema } from "../schemas";
import { prisma } from "@repo/database";

export async function addCalendarEvent(event: Event) {
  const parsedEvent = EventSchema.parse(event);
  CalendarEventSchema.parse(parsedEvent);
  const hashtags = getTags(event.tags, "t", 1);
  const bech32 = nip19.naddrEncode({
    identifier: getTag(event.tags, "d", 1) as string,
    pubkey: event.pubkey,
    kind: event.kind ?? 31923,
  });
  const calenderEvent = await prisma.calendarEvent.upsert({
    where: {
      pubkey_identifier: {
        identifier: getTag(event.tags, "d", 1) as string,
        pubkey: event.pubkey,
      },
    },
    create: {
      bech32: bech32,
      identifier: getTag(event.tags, "d", 1) as string,
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
          create: {
            ...event,
          },
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
      pubkey: event.pubkey,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: {
            ...event,
          },
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
}
export async function addCalendar(event: Event) {
  const parsedEvent = EventSchema.parse(event);
  const parsedCalendar = CalendarSchema.parse(parsedEvent);
  const content = JSON.parse(parsedCalendar.content) as { name: string } & {
    [key: string]: string;
  };
  const calendar = await prisma.user.upsert({
    where: {
      pubkey: event.pubkey,
    },
    create: {
      pubkey: event.pubkey,
      name: content.name,
      about: content?.about,
      picture: content?.picture,
      banner: content?.banner,
      lud06: content?.lud06,
      lud16: content?.lud16,
      nip05: content?.nip05,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: {
            ...event,
          },
        },
      },
      calendar: {
        connectOrCreate: {
          where: {
            pubkey: event.pubkey,
          },
          create: {
            pubkey: event.pubkey,
          },
        },
      },
    },
    update: {
      name: content.name,
      about: content?.about,
      picture: content?.picture,
      banner: content?.banner,
      lud06: content?.lud06,
      lud16: content?.lud16,
      nip05: content?.nip05,
      event: {
        connectOrCreate: {
          where: {
            id: event.id,
          },
          create: {
            ...event,
          },
        },
      },
      calendar: {
        connectOrCreate: {
          where: {
            pubkey: event.pubkey,
          },
          create: {
            pubkey: event.pubkey,
          },
        },
      },
    },
  });
  // const hashtags = getTags(event.tags, "t", 1);
}
