"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modal } from "@/app/providers/modal";
import CreateCalendar from "@/components/modals/createCalendar";
import { HiPlus, HiMinus } from "react-icons/hi";
import { api } from "@/lib/trpc/api";
import ControlledProfileAvatar from "@/components/profileAvatar/controlled";

type CalendarSelectorType = {
  selectedCalendar?: string | undefined;
  setCalendar: (cal?: string | undefined) => void;
};

export default function CalendarSelector({
  selectedCalendar,
  setCalendar,
}: CalendarSelectorType) {
  const [key, setKey] = useState<number>(+new Date());
  const { data: calendars, refetch: refetchCalendars } =
    api.user.getUserCalendars.useQuery();
  return (
    <Select
      key={key}
      onValueChange={(newValue) => setCalendar(newValue)}
      value={selectedCalendar}
    >
      <SelectTrigger
        id="calendar"
        className="items-start [&_[data-description]]:hidden [&_[data-image]]:hidden"
      >
        <SelectValue placeholder="Select a Calendar" />
      </SelectTrigger>
      <SelectContent>
        {calendars?.map((c) => (
          <SelectItem key={c.pubkey} value={c.pubkey}>
            <div className="text-muted-foreground flex items-center gap-2">
              {/* <div className="size-5 bg-red-50" /> */}

              <div className="" data-image>
                <ControlledProfileAvatar
                  pubkey={c.pubkey}
                  className="size-7 rounded-sm"
                />
              </div>
              <div className="grid gap-0.5">
                <p>
                  {/* {`${c.pubkey} `} */}
                  <span className="text-foreground font-medium">
                    {c.user.name}
                  </span>
                </p>
                <p className="line-clamp-1 text-xs" data-description>
                  {c.user.about}
                </p>
              </div>
            </div>
          </SelectItem>
        ))}
        {!!selectedCalendar && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setKey(+new Date());
              setCalendar(undefined);
            }}
            className="focus:text-accent-foreground hover:bg-muted relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <div className="text-muted-foreground flex items-center gap-2">
              <HiMinus className="size-3.5" />
              <p className="text-sm">Remove Calendar</p>
            </div>
          </div>
        )}
        <div
          onClick={() => {
            modal.show(
              <CreateCalendar
                callback={(newCalendarPubkey) => {
                  setCalendar(newCalendarPubkey);
                  refetchCalendars();
                }}
              />,
            );
          }}
          className="focus:text-accent-foreground hover:bg-muted relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          <div className="text-muted-foreground flex items-center gap-2">
            <HiPlus className="size-3.5" />
            <p className="text-sm">Create Calendar</p>
          </div>
        </div>
      </SelectContent>
    </Select>
  );
}
