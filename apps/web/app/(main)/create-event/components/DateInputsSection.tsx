"use client";
import { LuGlobe } from "react-icons/lu";
import { DatePicker } from "@/components/inputs/date-picker";
import { DateTimePicker } from "@/components/inputs/date-time-picker";
import ButtonContainer from "./ButtonContainer";

type DateInputsSection = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  timezone: (typeof TIMEZONES)[number];
  onChange: (
    data: Partial<{
      startDate: Date | undefined;
      endDate: Date | undefined;
      timezone: (typeof TIMEZONES)[number];
    }>,
  ) => void;
};
export default function DateInputsSection({
  startDate,
  endDate,
  timezone,
  onChange,
}: DateInputsSection) {
  return (
    <div className="@container/date w-full">
      <div className="flex w-full items-stretch gap-x-2">
        <div className="bg-muted relative flex-1 grow overflow-hidden rounded-lg">
          <div className="relative">
            <div className="border-muted-foreground/40 absolute inset-y-[1.8rem] left-[1.21rem] border-l border-dashed"></div>
            <div className="flex items-baseline justify-between p-1 pb-0 pl-2.5">
              <div className="bg-muted-foreground/30 mx-1 mr-2.5 size-3 shrink-0 rounded-full"></div>
              <div className="w-16 flex-1">Start</div>
              <div className="flex-2">
                <div className="w-auto max-w-full">
                  <DateTimePicker
                    date={startDate}
                    setDate={(newDate) => onChange({ startDate: newDate })}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-baseline justify-between p-1 pl-2.5">
              <div className="ring-muted-foreground/30 mx-1 mr-2.5 size-3 shrink-0 rounded-full ring-2 ring-inset"></div>
              <div className="w-16 flex-1">End</div>
              <div className="flex-2">
                <div className="w-auto max-w-full">
                  <DateTimePicker
                    date={endDate}
                    setDate={(newDate) => onChange({ endDate: newDate })}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Small Time Range */}
          <div className="@lg/date:hidden">
            <TimeZonePicker onChange={(v) => onChange({ timezone: v })}>
              <button className="flex w-full text-left">
                <ButtonContainer className="flex w-full items-center gap-x-2 rounded-t-none border-t px-3 py-2">
                  <LuGlobe className="text-muted-foreground/40 size-4" />
                  <div className="flex items-center gap-x-1">
                    <p className="text-foreground/80 text-[.9rem] font-medium">
                      {`GMT${timezone.utc}`}
                    </p>
                    <p className="text-foreground/80 text-xs font-medium">
                      {`${timezone.tzCode}`}
                    </p>
                  </div>
                </ButtonContainer>
              </button>
            </TimeZonePicker>
          </div>
        </div>

        <div className="@lg/date:flex hidden max-w-[150px] grow flex-col justify-items-stretch">
          <TimeZonePicker onChange={(v) => onChange({ timezone: v })}>
            <button className="flex w-full flex-1 items-stretch text-left">
              <ButtonContainer className="text-muted-foreground flex max-w-[150px] flex-1 grow flex-col gap-y-1.5 p-2 px-3">
                <LuGlobe className="size-4" />
                <div className="">
                  <p className="text-foreground/80 text-[.9rem] font-medium">
                    {`GMT${timezone.utc}`}
                  </p>
                  <p className="text-foreground/80 line-clamp-1 text-xs font-medium">
                    {`${timezone.tzCode}`}
                  </p>
                </div>
              </ButtonContainer>
            </button>
          </TimeZonePicker>
        </div>
      </div>
    </div>
  );
}

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode, useState } from "react";
import { TIMEZONES } from "@/constants/timezones";
function TimeZonePicker({
  children,
  onChange,
  align = "start",
}: {
  children: ReactNode;
  onChange: (v: {
    label: string;
    tzCode: string;
    name: string;
    utc: string;
  }) => void;
  align?: "center" | "end" | "start" | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="p-0" align={align}>
        <Command>
          <CommandInput placeholder="Search timezone" />
          <CommandList>
            <CommandEmpty>No timezones found.</CommandEmpty>
            <CommandGroup>
              {TIMEZONES.map((i) => (
                <CommandItem
                  key={i.name}
                  value={i.name}
                  onSelect={() => {
                    onChange(i);
                    setOpen(false);
                  }}
                  className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                >
                  <p>{i.tzCode}</p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {i.name}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
