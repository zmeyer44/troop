import Link from "next/link";
import Image from "next/image";

import Sidebar from "../components/sidebar";
import TabsSorter from "./components/tabsSorter";
import EventCard from "../events/components/eventCard";
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

export const revalidate = 3600; // revalidate at most every hour

export default async function Page() {
  const eventsReceived = await getEvents();
  const lastRevalidated = new Date();
  return (
    <div className="relative flex w-full flex-1 justify-center">
      <div className="flex-1 shrink grow space-y-3 p-3">
        <p>{lastRevalidated.toISOString()}</p>
        <div className="">
          <TabsSorter />
        </div>
        <div className="md-feed-cols gap-3">
          {eventsReceived.map((v) => (
            <Link key={v.eventId} href={`/events/${v.bech32}`}>
              <EventCard event={v} />
            </Link>
          ))}
        </div>
      </div>

      <div className="">
        <Suspense>
          <HotSpots />
        </Suspense>
      </div>
    </div>
  );
}

async function HotSpots() {
  const locations = await prisma.place.findMany();
  return (
    <Sidebar
      title="Hot Spots"
      titleClassName="text-lg"
      subtitle="Here are some of the locations with the most upcoming events."
    >
      <div className="flex flex-col gap-y-3">
        {locations.map((l) => (
          <Link key={l.id} href={`/locations/${l.slug}`}>
            <LocationCard {...l} />
          </Link>
        ))}
      </div>
    </Sidebar>
  );
}
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Place } from "@repo/database";
import { Suspense } from "react";
function LocationCard({ name, image, description }: Place) {
  return (
    <div className="relative flex h-full gap-x-2">
      {/* Thumbnail */}
      <div className="size-14 shrink-0">
        <div className="relative w-full">
          <div className="relative overflow-hidden rounded-md">
            <AspectRatio ratio={1} className="bg-muted">
              {!!image && (
                <Image
                  src={image}
                  alt={name}
                  width={450}
                  height={250}
                  unoptimized
                  className={cn(
                    "h-full w-full object-cover transition-all group-hover:scale-105",
                    "aspect-video",
                  )}
                />
              )}
            </AspectRatio>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className="flex flex-auto">
        <div className="overflow-x-hidden">
          <h2 className="text-foreground mb-1 line-clamp-2 text-[.95rem] font-semibold leading-tight">
            {name}
          </h2>
          <div className="flex flex-col">
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
