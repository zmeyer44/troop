"use client";
import { ReactNode, useState, Dispatch, SetStateAction } from "react";
import { Separator } from "@/components/ui/separator";
import { LuTicket, LuUserCheck, LuArrowUpNarrowWide } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import useBitcoinPrice from "@/lib/hooks/useBitcoinPrice";

type TicketInfoSectionProps = {
  price: number | undefined;
  requireApproval: boolean;
  maxCapacity: number | undefined;
  overflowWaitlist: boolean;
  lightningAddress: string | undefined;
  onChange: (
    newData: Partial<{
      price: number | undefined;
      requireApproval: boolean;
      maxCapacity: number | undefined;
      overflowWaitlist: boolean;
      lightningAddress: string | undefined;
    }>,
  ) => void;
};
export default function TicketInfoSection({
  price,
  requireApproval,
  lightningAddress,
  maxCapacity,
  overflowWaitlist,
  onChange,
}: TicketInfoSectionProps) {
  const items = [
    {
      label: "Tickets",
      icon: LuTicket,
      action: () => (
        <div className="">
          <TicketPrice
            initialPrice={price}
            initialLightningAddress={lightningAddress}
            handleSave={({ price, lightningAddress }) => {
              onChange({ price, lightningAddress });
            }}
          />
        </div>
      ),
    },

    {
      label: "Require Approval",
      icon: LuUserCheck,
      action: () => (
        <div className="px-3">
          <Switch
            checked={requireApproval}
            onCheckedChange={(newVal) => {
              onChange({ requireApproval: newVal });
            }}
          />
        </div>
      ),
    },
    {
      label: "Max Capacity",
      icon: LuArrowUpNarrowWide,
      action: () => (
        <div className="">
          <MaxCapacity
            initialMaxCapacity={maxCapacity}
            initialOverflowWaitlist={overflowWaitlist}
            handleSave={({ maxCapacity, overflowWaitlist }) => {
              onChange({ maxCapacity, overflowWaitlist });
            }}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="mt-2">
      <h3 className="text-muted-foreground mb-1 text-sm font-semibold">
        Ticket Options
      </h3>
      <div className="bg-muted rounded-lg px-3 py-2">
        {items.map((i, index) => (
          <>
            {index !== 0 && (
              <div key={`ticket-info-spacer-${index}`} className="px-4 py-1.5">
                <Separator />
              </div>
            )}
            <div
              key={`ticket-info-${i.label}`}
              className="flex min-h-[36px] items-center gap-x-2"
            >
              <div className="shrink-0">
                <i.icon className="text-muted-foreground/30 size-5" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <p className="text-muted-foreground text-base font-medium">
                  {i.label}
                </p>
                <i.action />
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatNumber } from "@/lib/utils";
export function MaxCapacity({
  initialMaxCapacity,
  initialOverflowWaitlist,
  handleSave,
}: {
  initialMaxCapacity: number | undefined;
  initialOverflowWaitlist: boolean;
  handleSave: (props: {
    overflowWaitlist: boolean;
    maxCapacity: number | undefined;
  }) => void;
}) {
  const [overflowWaitlist, setOverflowWaitlist] = useState(
    initialOverflowWaitlist,
  );
  const [maxCapacity, setMaxCapacity] = useState<number | undefined>(
    initialMaxCapacity,
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          {typeof initialMaxCapacity === "number"
            ? formatNumber(initialMaxCapacity)
            : "Unlimited"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Max Capacity</h4>
            <p className="text-muted-foreground text-sm">
              Auto-close registration when the capacity is reached.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                placeholder="Max attendees"
                className="col-span-2 h-8"
                value={maxCapacity}
                onChange={(e) => {
                  const number = parseInt(e.target.value);
                  if (isNaN(number)) {
                    setMaxCapacity(undefined);
                  } else {
                    setMaxCapacity(number);
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="overflowWaitlist">Over-Flow Waitlist</Label>
              <Switch
                id="overflowWaitlist"
                checked={overflowWaitlist}
                onCheckedChange={setOverflowWaitlist}
              />
            </div>
          </div>
          <Button
            onClick={() =>
              handleSave({
                maxCapacity,
                overflowWaitlist,
              })
            }
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
export function TicketPrice({
  initialPrice,
  initialLightningAddress,
  handleSave,
}: {
  initialPrice: number | undefined;
  initialLightningAddress: string | undefined;
  handleSave: (props: {
    price: number | undefined;
    lightningAddress: string | undefined;
  }) => void;
}) {
  const { formatAsMoney } = useBitcoinPrice();

  const [price, setPrice] = useState<number | undefined>(initialPrice);
  const [lightningAddress, setLightningAddress] = useState<string | undefined>(
    initialLightningAddress,
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          {typeof initialPrice === "number"
            ? `${formatNumber(initialPrice)} sats (${formatAsMoney(initialPrice)})`
            : "Free"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Ticket Price</h4>
            <p className="text-muted-foreground text-sm">
              Set a price in sats for each ticket and add your lightning address
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="Free"
                className="col-span-2 h-8"
                value={price}
                onChange={(e) => {
                  const number = parseInt(e.target.value);
                  if (isNaN(number)) {
                    setPrice(undefined);
                  } else {
                    setPrice(number);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lightning">Lighnting Address</Label>
              <Input
                id="lightning"
                placeholder="lud06 or lud16"
                className="col-span-2 h-8"
                value={lightningAddress}
                onChange={(e) => {
                  setLightningAddress(e.target.value);
                }}
              />
            </div>
          </div>
          <Button
            onClick={() =>
              handleSave({
                price,
                lightningAddress,
              })
            }
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
