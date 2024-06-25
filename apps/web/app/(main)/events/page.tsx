import TabsSorter from "./components/topics";
import EventCard from "./components/eventCard";
import Link from "next/link";
import { prisma } from "@repo/database";

async function getEvents() {
  const eventsReceived = await prisma.calendarEvent.findMany({
    where: {
      start: {
        gt: Math.floor(new Date().getTime() / 1000),
      },
      image: {
        not: null,
      },
    },
    orderBy: {
      start: "asc",
    },
    take: 100,
    include: {
      tags: true,
    },
  });
  return eventsReceived;
}

export const revalidate = 60; // revalidate at most every hour

export default async function Page() {
  const eventsReceived = await getEvents();

  return (
    <div className="flex-1 overflow-x-hidden">
      <div className="">
        <TabsSorter />
      </div>
      <div className="md-feed-cols gap-3 p-3">
        {eventsReceived.map((v) => (
          <Link key={v.eventId} href={`/events/${v.bech32}`}>
            <EventCard event={v} />
          </Link>
        ))}
      </div>
    </div>
  );
}
