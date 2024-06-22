import Link from "next/link";
import CalendarCard from "./components/calendarCard";
import PageTitle from "@/components/headings/pageTitle";
import { prisma } from "@repo/database";

export default async function CalendarsPage() {
  const calendarsReceived = await prisma.calendar.findMany({
    where: {
      user: {
        picture: {
          not: null,
        },
      },
    },
    include: {
      user: true,
    },
  });
  return (
    <div className="flex-1 overflow-x-hidden">
      <PageTitle
        title={"Featured Calendars"}
        subtitle="See if you can find some local meetups"
      />

      <div className="md-feed-cols gap-3 p-3">
        {calendarsReceived.map((c) => (
          <CalendarCard key={c.pubkey} calendar={c} />
        ))}

        {/* {calendarsReceived.map((v) => (
          <Link key={v.event_id} href={`/events/${v.bech32}`}>
            <EventCard event={v} />
          </Link>
        ))} */}
      </div>
    </div>
  );
}
