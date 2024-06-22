"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { nanoid } from "nanoid";
import { NostrEvent, nip19 } from "nostr-tools";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";

import Link from "next/link";
import Image from "next/image";
import { cn, satsToBtc } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useNDK } from "@/app/providers/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Button } from "@/components/ui/button";
import { TIMEZONES } from "@/constants/timezones";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { TimeBasedCalendarEventKind } from "@/constants";
import { convertToTimezone, toUnix } from "@/lib/utils/dates";
import useAutosizeTextArea from "@/lib/hooks/useAutoSizeTextArea";
import useAuthGuard from "@/components/modals/hooks/useAuthGuard";
import {
  addCalendarEvent,
  createCalendarEvent,
} from "@/actions/createEvent/calendarEvent";

import CalendarSelector from "./components/CalendarSelector";
import DateInputsSection from "./components/DateInputsSection";
import TicketInfoSection from "./components/TicketInfoSection";
import ImageUploadSection from "./components/ImageUploadSection";
import LocationInputSection from "./components/LocationInputSection";
import DescriptionInputSection from "./components/DescriptionInputSection";

export default function CreateEventPage() {
  const { ndk } = useNDK();
  useAuthGuard();
  const router = useRouter();
  const [error, setError] = useState<Record<string, string | undefined>>({});
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calendarPubkey, setCalendarPubkey] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(titleRef.current, title);
  const [image, setImage] = useState<string | undefined>();
  const handleSetImage = useCallback((image: string) => {
    setImage(image);
  }, []);

  const [description, setDescription] = useState("");

  const [dateData, setDateData] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    timezone: (typeof TIMEZONES)[number];
  }>({
    startDate: undefined,
    endDate: undefined,
    timezone:
      TIMEZONES.find(
        (t) => t.tzCode === Intl.DateTimeFormat().resolvedOptions().timeZone,
      ) ?? TIMEZONES[0]!,
  });
  const [location, setLocation] = useState<
    | {
        name: string;
        address: string;
        coordinates: { lat: number; lng: number };
        geohash: string;
      }
    | undefined
  >();
  const [ticketOptions, setTicketOptions] = useState<{
    price: number | undefined;
    requireApproval: boolean;
    maxCapacity: number | undefined;
    overflowWaitlist: boolean;
    lightningAddress: string | undefined;
  }>({
    price: undefined,
    requireApproval: false,
    maxCapacity: undefined,
    overflowWaitlist: false,
    lightningAddress: undefined,
  });

  function checkErrors() {
    setErrorMessage("");
    if (!title) {
      setErrorMessage("Please enter a title for your event");
      return true;
    } else if (!description) {
      setErrorMessage("Please enter a description for your event");
      return true;
    } else if (!dateData.startDate) {
      setErrorMessage("Please enter a start date for your event");
      return true;
    } else if (!dateData.endDate) {
      setErrorMessage("Please enter an end date for your event");
      return true;
    } else if (!location) {
      setErrorMessage("Please enter a location for your event");
      return true;
    } else if (!ndk) {
      setErrorMessage("NDK provider not found");
      return true;
    }
    return false;
  }

  async function handleSubmit() {
    if (checkErrors()) {
      return;
    }
    try {
      setIsSubmitting(true);

      const markdown = NodeHtmlMarkdown.translate(
        /* html */ description,
        /* options (optional) */ {},
        /* customTranslators (optional) */ undefined,
        /* customCodeBlockTranslators (optional) */ undefined,
      );
      const identifier = nanoid(7);
      const tags = [
        ["d", identifier],
        ["title", title],
        ["description", markdown],
        [
          "start",
          toUnix(
            convertToTimezone(dateData.startDate!, dateData.timezone.tzCode),
          ).toString(),
        ],
        [
          "end",
          toUnix(
            convertToTimezone(dateData.endDate!, dateData.timezone.tzCode),
          ).toString(),
        ],
        ["start_tzid", dateData.timezone.tzCode],
        // ["p", currentUser.pubkey, "", "host"],
      ];
      if (image) {
        tags.push(["image", image]);
      }
      if (location) {
        tags.push(["g", location.geohash]);
        tags.push([
          "location",
          `${location.name}, ${location.address}`,
          location.name,
          location.address,
        ]);
      }
      if (ticketOptions.requireApproval) {
        tags.push(["require-approval", "true"]);
      }
      if (ticketOptions.price) {
        tags.push(["price", satsToBtc(ticketOptions.price).toString(), "btc"]);
      }
      if (ticketOptions.maxCapacity) {
        tags.push(["max-capacity", ticketOptions.maxCapacity.toString()]);
      }

      let eventToPublish: NDKEvent | undefined;
      if (calendarPubkey) {
        const eventToCreate = await createCalendarEvent(
          {
            content: markdown,
            kind: TimeBasedCalendarEventKind,
            tags: [...tags, ["client", "troop"]],
          },
          calendarPubkey,
        );
        eventToPublish = new NDKEvent(ndk, eventToCreate);
        await eventToPublish.publish();
      } else {
        const eventToCreate = await createCalendarEvent({
          content: markdown,
          kind: TimeBasedCalendarEventKind,
          tags: [...tags, ["client", "troop"]],
        });
        eventToPublish = new NDKEvent(ndk, eventToCreate);
        await eventToPublish.sign();
        await eventToPublish.publish();
      }
      if (eventToPublish) {
        const bech32 = nip19.naddrEncode({
          identifier: identifier,
          kind: TimeBasedCalendarEventKind,
          pubkey: eventToPublish.pubkey,
        });
        await addCalendarEvent(eventToPublish.rawEvent() as NostrEvent);
        toast({
          title: "Event Created!",
          description: "Your event has been successfully published to relays.",
          action: (
            <Link href={`/events/${bech32}`}>
              <Button variant={"outline"}>View Event</Button>
            </Link>
          ),
        });
        router.push(`/events/${bech32}`);
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem publishing your event.",
          action: <Button variant={"destructive"}>Try again</Button>,
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message;
      console.log("Error", err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
        action: <Button variant={"destructive"}>Try again</Button>,
      });
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="@2xl/main:flex-row @3xl/main:gap-x-7 mx-auto flex w-full max-w-5xl flex-col gap-x-5 gap-y-3 px-3">
      <div className="@2xl/main:max-w-[300px] @3xl/main:max-w-[330px] mx-auto flex w-full max-w-[400px] flex-col gap-y-5">
        <ImageUploadSection url={image} onChange={handleSetImage} />
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          {/* Calendar Selector */}
          <div className="flex items-center justify-between">
            <div className="">
              <CalendarSelector
                setCalendar={(newCalendar) => setCalendarPubkey(newCalendar)}
                selectedCalendar={calendarPubkey}
              />
            </div>
          </div>
          {/* Event Title */}
          <div className="@2xl/main:mb-2">
            <Textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus={true}
              placeholder="Event Name"
              className={cn(
                "invisible-input text-foreground placeholder:text-muted-foreground/50 placeholder:hover:text-muted-foreground/80 @3xl/main:text-4xl max-h-none text-3xl font-bold outline-none",
                title === "" && "max-h-[45px]",
                error["title"] &&
                  "border-destructive border-b placeholder:text-red-600/50",
              )}
            />
          </div>
          {/* Date Inputs */}
          <div className="">
            <DateInputsSection
              {...dateData}
              onChange={(newData) =>
                setDateData((prev) => ({ ...prev, ...newData }))
              }
            />
          </div>
          {/* Location Input */}
          <div className="">
            <LocationInputSection
              location={location}
              onSelect={(l) => setLocation(l)}
            />
          </div>
          {/* Description Input */}
          <div className="">
            <DescriptionInputSection
              content={description}
              onChange={(newContent) => setDescription(newContent)}
            />
          </div>
          {/* Ticket Info Section */}
          <div className="">
            <TicketInfoSection
              {...ticketOptions}
              onChange={(newData) =>
                setTicketOptions((prev) => ({ ...prev, ...newData }))
              }
            />
          </div>
          {!!errorMessage && (
            <div className="text-destructive border-destructive bg-destructive/10 rounded-lg border p-4 py-3 text-sm">
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="w-full pt-4">
            <Button
              loading={isSubmitting}
              onClick={handleSubmit}
              className="w-full"
              size={"lg"}
            >
              Create Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
