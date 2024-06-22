import TabsSorter from "./components/topics";
import EventCard from "./components/eventCard";
import Link from "next/link";
import { prisma } from "@repo/database";

export default async function Page() {
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
    take: 50,
    include: {
      tags: true,
    },
  });

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
