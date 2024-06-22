"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { CalendarEvent } from "@repo/database";
import BannerImage from "@/components/images/bannerImage";
import { Button } from "@/components/ui/button";
import DateIcon from "@/components/dateIcon";
import PinIcon from "@/components/pinIcon";
import PlainText from "@/components/markdown/plainText";

type EventHeaderProps = {
  calendarEvent: CalendarEvent;
};

export default function HeaderSection({
  calendarEvent: {
    title,
    description,
    start,
    end,
    location,
    geohash,
    image,
    pubkey,
  },
}: EventHeaderProps) {
  const startDate = new Date(start * 1000);
  return (
    <div className="relative overflow-hidden">
      <div className="overflow-hidden rounded-[0.5rem] p-0">
        <div className="from-primary relative w-full overflow-hidden rounded-lg bg-gradient-to-b to-transparent pb-[calc(clamp(75px,40%,300px))]">
          {!!image && <BannerImage image={image} />}
        </div>
      </div>

      <div className="@sm/main:pb-2 @sm/main:pt-5 space-y-1 pt-3">
        <div className="@lg/main:gap-x-2.5 flex items-start justify-between gap-x-1.5 overflow-hidden">
          <div className="@sm/main:space-y-2 space-y-1">
            <h2 className="font-condensed font-cal @2xl/main:text-5xl @lg/main:text-4xl text-3xl font-bold leading-7">
              {title}
            </h2>
            <div className="flex items-center">
              {/* <CalendarInfo eventReference={eventReference} /> */}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button>Register</Button>

            {/* {!isMember &&
              (hasValidPayment ? (
                <Button variant={"outline"}>Pending Sync</Button>
              ) : (
                <Button
                  onClick={() =>
                    modal?.show(
                      <ConfirmModal
                        title={`Subscribe to ${title}`}
                        onConfirm={handleSendZap}
                        ctaBody={
                          <>
                            <span>Zap to Subscribe</span>
                            <HiOutlineLightningBolt className="h-4 w-4" />
                          </>
                        }
                      >
                        <p className="text-muted-forground">
                          {`Pay ${priceInBTC} BTC (${formatNumber(
                            btcToSats(priceInBTC),
                          )} sats) for year long access until ${formatDate(
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 1,
                              ),
                            ),
                            "MMM Do, YYYY",
                          )}`}
                        </p>
                      </ConfirmModal>,
                    )
                  }
                >
                  RSVP
                </Button>
              ))} */}
          </div>
        </div>
        <div className="@md/main:pt-2 @2xl/main:flex-row flex flex-col gap-x-6 gap-y-3 pt-1">
          <div
            className="flex-2"
            style={{
              flex: "2 2 0%",
            }}
          >
            <PlainText markdown={description ?? ""} />
          </div>
          <div className="@2xl/main:pt-0 @2xl/main:justify-end flex flex-1 pt-3">
            <div className="flex flex-col gap-3 pr-3">
              {/* Date Info */}
              <div className="flex items-center gap-3">
                <DateIcon date={startDate} />
                <div className="">
                  <p className="text-bold @xl/main:text-base text-sm">
                    {formatDate(startDate, "dddd, MMMM Do")}
                  </p>
                  {end && (
                    <p className="@xl/main:text-sm text-muted-foreground text-xs">{`${formatDate(
                      startDate,
                      "h:mm a",
                    )} to ${formatDate(new Date(end * 1000), "h:mm a")}`}</p>
                  )}
                </div>
              </div>

              {/* Location */}

              <div className="flex items-center gap-3">
                <PinIcon />
                <div className="overflow-hidden">
                  <p className="text-bold @xl/main:text-base line-clamp-2 text-sm">
                    {location}
                  </p>
                  {/* <p className="@xl:text-sm text-muted-foreground line-clamp-2 text-xs">
                    {address}
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
