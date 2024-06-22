"use client";
import Image from "next/image";
import { cn, formatCount } from "@/lib/utils";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/utils/dates";
import { Badge } from "@/components/ui/badge";
import DateIcon from "./dateIcon";
import { CalendarEvent, Tag } from "@repo/database";

type EventCardProps = {
  event: CalendarEvent & {
    tags: Tag[];
  };
};
export default function EventCard({ event }: EventCardProps) {
  const { image, location, title, description, start, tags, end } = event;

  return (
    <div className="relative aspect-square h-full w-full">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <AspectRatio ratio={1} className="bg-muted">
          {!!image && (
            <Image
              src={image}
              alt={title}
              width={450}
              height={450}
              unoptimized
              className={cn(
                "h-full w-full object-cover transition-all group-hover:scale-105",
                "aspect-square",
              )}
            />
          )}
        </AspectRatio>
      </div>
      <div className="z-10 flex h-full w-full flex-col justify-end overflow-hidden p-3">
        {/* Details */}
        <div className="bg-frosted-60 hover:bg-frosted-80 border-forsted-80 group relative max-h-[130px] flex-1 overflow-clip rounded-[1rem] border backdrop-blur-lg transition-all hover:max-h-full">
          <div className="from-frosted-90 via-frosted-40 absolute inset-x-0 bottom-0 z-20 h-10 w-full bg-gradient-to-t to-transparent transition-opacity group-hover:opacity-0"></div>
          <div
            className={cn(
              "scrollbar-none h-full space-y-1 p-2.5 group-hover:overflow-y-auto",
            )}
          >
            <div className="flex gap-x-3">
              <div className="flex-1 overflow-x-hidden">
                <h2 className="text-foreground line-clamp-2 text-[.95rem] font-semibold leading-tight">
                  {title}
                </h2>
              </div>
              <div className="shrink-0">
                <DateIcon date={new Date(start * 1000)} />
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="font-medium">
                <p className="text-muted-foreground line-clamp-3 text-[.8rem]">
                  {description}
                </p>
              </div>
              <div className="text-muted-foreground flex w-full items-center gap-x-1 overflow-hidden text-[.8rem] font-medium">
                <p className="truncate whitespace-nowrap">{`${location} views`}</p>
                {/* {!!publishedAt && (
                  <>
                    <span>•</span>
                    <p className="whitespace-nowrap">
                      {relativeTime(new Date(publishedAt * 1000))}
                    </p>
                  </>
                )} */}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {tags.map(({ id, label }) => (
                  <Badge key={id} className="rounded-sm">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
