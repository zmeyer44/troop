import Link from "next/link";
import Image from "next/image";
import { fetchPosts } from "@/data";
import { DUMMY_1 } from "@/constants";
import Kind1Card from "@/components/eventCards/1";
import Sidebar from "../../components/sidebar";
// import TabsSorter from "../../components/tabsSorter";
import EventCard from "../../events/components/eventCard";
import TabsSorter from "./components/tabsSorter";
import { prisma, Place } from "@repo/database";
export default async function Page({
  params,
}: {
  params: { locationSlug: string };
}) {
  const place = await prisma.place.findFirst({
    where: {
      slug: params.locationSlug,
    },
    include: {
      calendarEvents: {
        where: {
          start: {
            gte: Math.floor(new Date().getTime() / 1000),
          },
        },
        orderBy: {
          start: "asc",
        },
        include: {
          tags: true,
        },
      },
    },
  });

  if (!place) {
    return notFound();
  }
  return (
    <div className="flex-1">
      <div className="mx-auto px-3">
        <BannerImage location={place} />
      </div>
      <div className="relative flex w-full flex-1 justify-center">
        <div className="flex-1 shrink grow space-y-3 p-3">
          <div className="">
            <TabsSorter />
          </div>
          <div className="md-feed-cols gap-3">
            {place.calendarEvents.map((v) => (
              <Link key={v.eventId} href={`/events/${v.bech32}`}>
                <EventCard event={v} />
              </Link>
            ))}
          </div>
          {place.calendarEvents.length === 0 && (
            <div className="center text-muted-foreground w-full text-sm">
              <p>{`No Upcoming events in ${place.name}`}</p>
            </div>
          )}
        </div>
        <div className="">
          <Sidebar
            title="Popular Calendars"
            subtitle="The most popular calendars in New York."
          >
            <div className="flex flex-col gap-y-3">
              {/* {place.calendarEvents.map((v) => (
                <Link key={v.event_id} href={`/calendars/${v.bech32}`}>
                  <CalendarPreviewCard />
                </Link>
              ))} */}
            </div>
          </Sidebar>
        </div>
      </div>
    </div>
  );
}
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

function CalendarPreviewCard() {
  const thumbnail =
    "https://image.nostr.build/7abf1bc45ea2cc341917ecd5400858429a98c6897f19622df018edc206a23474.png";
  const title = "New York City";
  return (
    <div className="relative flex h-full gap-x-2">
      {/* Thumbnail */}
      <div className="size-14 shrink-0">
        <div className="relative w-full">
          <div className="relative overflow-hidden rounded-md">
            <AspectRatio ratio={1} className="bg-muted">
              {!!thumbnail && (
                <Image
                  src={thumbnail}
                  alt={title}
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
            {title}
          </h2>
          <div className="flex flex-col">
            <p className="text-muted-foreground line-clamp-2 text-xs">
              THis sis a awigngoian grivan r awrig apiw apiwv aipwr jaij wjw
              pawij
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerImage({
  location: { image, name, description },
}: {
  location: Place;
}) {
  return (
    <div className="from-primary relative z-10 min-h-[75px] w-full overflow-hidden rounded-xl bg-gradient-to-b pb-[calc(clamp(150px,30%,330px))]">
      {!!image && (
        <div className="from-primary to-frosted absolute inset-0 -z-10 bg-gradient-to-t">
          <Image
            src={image}
            alt={"banner image"}
            fill
            unoptimized
            objectFit="cover"
            className="object-cover"
          />
        </div>
      )}
      <div className="absolute inset-0 flex">
        <div className="@3xl/main:p-6 relative flex flex-1 items-end p-3">
          <div className="@3xl/main:w-7/12">
            <h1 className="font-cal text-foreground @3xl/main:text-5xl @xl/main:text-4xl text-2xl">
              {name}
            </h1>
            <p className="text-foreground/80 @3xl/main:text-base @xl/main:text-sm mt-1 line-clamp-2 text-xs">
              {description}
            </p>
          </div>
          <div className="from-frosted-80 via-frosted-70 absolute inset-0 -z-10 bg-gradient-to-tr from-10% via-30% to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
