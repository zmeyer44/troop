import { Metadata, ResolvingMetadata } from "next";
import { prisma, CalendarEvent } from "@repo/database";
import { nip19 } from "nostr-tools";
import { getProfile } from "@/actions/nostr/user/get";
import { getCalendarEvent } from "@/actions/nostr/calendarEvent/get";
import HeaderSection from "./components/HeaderSection";
import LocationSection from "./components/LocationSection";
import { notFound } from "next/navigation";
import { constructEventImage } from "@/app/api/social/og/utils";
import Image from "next/image";
import DateIcon from "../components/dateIcon";
import PinIcon from "../components/pinIcon";
import { formatDateUnix } from "@/lib/utils/dates";
import { LuChevronRight } from "react-icons/lu";
import PlainText from "@/components/markdown/plainText";
import InfoSection from "./components/InfoSection";
import PresentedBySection, {
  CalendarLink,
} from "./components/PresentedBySection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RegistrationSection from "./components/Registration";

type PageProps = {
  params: {
    tagId: string;
  };
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata | null | undefined> {
  try {
    let event;
    let tagId = decodeURIComponent(params.tagId);
    if (tagId.startsWith("naddr") && nip19.BECH32_REGEX.test(tagId)) {
      event = await prisma.calendarEvent.findFirst({
        where: {
          bech32: tagId,
        },
      });
    } else {
      event = await prisma.calendarEvent.findFirst({
        where: {
          slug: tagId,
        },
      });
    }

    if (!event) return;

    const title = `${event.title} | troop`;
    const description = event.description ?? "";
    const image = `${`https://troop.is`}/api/social/og${constructEventImage(event)}`;
    return {
      title: title,
      openGraph: {
        title: title,
        description: description,
        images: [image],
      },
      twitter: {
        title: title,
        description: description,
        images: [image],
        card: "summary_large_image",
      },
    };
  } catch (err) {
    console.log("Error generating metadata");
  }
}

export default async function Page({ params }: PageProps) {
  let event;
  let tagId = decodeURIComponent(params.tagId);
  if (tagId.startsWith("naddr") && nip19.BECH32_REGEX.test(tagId)) {
    const { data, type } = nip19.decode(tagId);
    if (type !== "naddr") return notFound();
    event = await prisma.calendarEvent.findFirst({
      where: {
        pubkey: data.pubkey,
        identifier: data.identifier,
      },
    });
    if (!event) {
      const found = await getCalendarEvent(tagId);
      if (found) {
        event = await prisma.calendarEvent.findFirst({
          where: {
            pubkey: data.pubkey,
            identifier: data.identifier,
          },
        });
      }
    }
  } else {
    event = await prisma.calendarEvent.findFirst({
      where: {
        slug: tagId,
      },
    });
  }

  if (!event) {
    return notFound();
  }
  return (
    <div className="@2xl/main:flex-row @3xl/main:gap-x-7 mx-auto flex w-full max-w-5xl flex-col gap-x-5 gap-y-3 px-3">
      <div className="@2xl/main:max-w-[300px] @3xl/main:max-w-[330px] mx-auto flex w-full max-w-[400px] flex-col gap-y-5">
        {event.image && (
          <div className="center relative overflow-hidden rounded-lg bg-gradient-to-t pb-[100%]">
            <div className="from-primary to-frosted absolute inset-0 bg-gradient-to-t">
              <Image
                src={event.image}
                alt={"banner image"}
                fill
                unoptimized
                objectFit="cover"
                className="object-cover"
              />
            </div>
          </div>
        )}
        <PresentedBySection event={event} className="@2xl/main:block hidden " />
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          {/* Event Title */}
          <div className="@2xl/main:mb-2">
            <h1 className="font-cal @3xl/main:text-5xl text-4xl font-bold">
              {event.title}
            </h1>
          </div>
          {/* Hosts */}
          <div className="@2xl/main:hidden mb-1 space-y-1">
            <div className="flex items-center">
              <h3 className="text-muted-foreground font-semibold">Hosted by</h3>
            </div>
            <CalendarLink event={event} />
          </div>
          {/* Date and Location */}
          <div className="">
            <div className="flex flex-col gap-3 pr-3">
              {/* Date Info */}
              <div className="flex items-center gap-3">
                <DateIcon date={new Date(event.start * 1000)} />
                <div className="">
                  <p className="@xl/main:text-base text-sm font-semibold">
                    {formatDateUnix(event.start, "dddd, MMMM Do")}
                  </p>
                  {event.end && (
                    <p className="@xl/main:text-sm text-muted-foreground text-xs">{`${formatDateUnix(
                      event.start,
                      "h:mm a",
                    )} to ${formatDateUnix(event.end, "h:mm a")}`}</p>
                  )}
                </div>
              </div>

              {/* Location */}

              <div className="flex items-center gap-3">
                <PinIcon />
                <div className="overflow-hidden">
                  <p className="@xl/main:text-base line-clamp-2 text-sm font-semibold">
                    {event.location}
                  </p>
                  {/* <p className="@xl:text-sm text-muted-foreground line-clamp-2 text-xs">
                    {address}
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Registration */}
        <RegistrationSection state="waitlist" />
        {/* MarkDown Section */}
        <InfoSection title={"About Event"}>
          <PlainText markdown={event.description ?? ""} />
        </InfoSection>
        {/* Location Section */}
        <InfoSection title={"Location"}>
          {!!event.geohash && (
            <LocationSection
              geohash={event.geohash}
              address={event.location ?? ""}
            />
          )}
        </InfoSection>
        <PresentedBySection event={event} className="@2xl/main:hidden" />
      </div>
    </div>
  );
}
