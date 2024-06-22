"use client";
import Image from "next/image";
import { cn, formatCount } from "@/lib/utils";
import { Calendar, User } from "@repo/database";
import RawProfileAvatar from "@/components/profileAvatar/raw";
import { Button } from "@/components/ui/button";
type CalendarCardProps = {
  calendar: Calendar & {
    user: User;
  };
};
export default function CalendarCard({ calendar }: CalendarCardProps) {
  const {
    user: { about, name, picture },
  } = calendar;

  return (
    <div className="bg-muted relative h-full w-full space-y-3 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="shrink-0">
          <RawProfileAvatar
            name={name}
            image={picture}
            className="bg-muted-foreground/20 size-14 rounded-md"
          />
        </div>
        <Button
          variant={"secondary"}
          size={"default"}
          className="h-8 rounded-full"
        >
          Follow
        </Button>
      </div>
      <div className="w-full">
        <h3 className="font-cal text-foreground truncate text-xl">{name}</h3>
        <p className="text-muted-foreground line-clamp-3 text-sm">{about}</p>
      </div>
    </div>
  );
}
