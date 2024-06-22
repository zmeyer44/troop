"use client";
import { useRef, useEffect, useState } from "react";
import { RiMoreFill } from "react-icons/ri";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import ProfileHeader, { LoadingProfileHeader } from "./ProfileHeader";
// import { getTagsValues } from "@/lib/nostr/utils";
import Actions from "./Actions";
import Tags from "./Tags";
import DropDownMenu from "@/components/dropDownMenu";
// import { removeDuplicates } from "@/lib/utils";
import { type KindCardProps } from "..";
import { cn } from "@/lib/utils";

type OptionLink = {
  href: string;
  type: "link";
};
type OptionButton = {
  onClick: () => void;
  type: "button";
};
type Option = {
  label: string;
} & (OptionLink | OptionButton);

type CreatorCardProps = {
  children: ReactNode;
  actionOptions?: Option[];
  event?: KindCardProps;
};

export default function Container({
  children,
  actionOptions = [],
  event,
}: CreatorCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandButton, setExpandButton] = useState<boolean | null>(null);
  const [showFull, setShowFull] = useState(false);
  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > 350) {
        setExpandButton(true);
      } else {
        setExpandButton(false);
      }
    }
  }, [contentRef.current, contentRef.current?.scrollHeight]);

  if (!event) {
    return (
      <Card className="@container relative flex h-full w-full flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-4">
          <LoadingProfileHeader />
          <div className="text-muted-foreground -mr-1 flex items-center gap-x-1.5 text-xs">
            <DropDownMenu options={[]}>
              <Button
                size={"sm"}
                variant={"ghost"}
                className="center h-6 w-6 p-0"
              >
                <RiMoreFill className="h-4 w-4" />
              </Button>
            </DropDownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex grow flex-col px-4 pb-3">
          {children}
          <div className="mt-auto"></div>
        </CardContent>
      </Card>
    );
  }
  const { pubkey, tags, created_at: createdAt } = event;
  // const contentTags = removeDuplicates(getTagsValues("t", tags)).filter(
  //   Boolean,
  // );
  const contentTags: string[] = [];

  return (
    <Card className="@container relative flex h-full w-full flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-4">
        {pubkey ? <ProfileHeader pubkey={pubkey} /> : <LoadingProfileHeader />}
        <div className="text-muted-foreground -mr-1 flex items-center gap-x-1.5 text-xs">
          <span className="line-clamp-1">
            {!!createdAt &&
              formatDate(new Date(createdAt * 1000), "MMM Do, h:mm a")}
          </span>
          <DropDownMenu options={actionOptions}>
            <Button
              size={"sm"}
              variant={"ghost"}
              className="center h-6 w-6 p-0"
            >
              <RiMoreFill className="h-4 w-4" />
            </Button>
          </DropDownMenu>
        </div>
      </CardHeader>
      <CardContent className={cn("flex grow flex-col px-4 pb-3")}>
        <div
          ref={contentRef}
          className={cn(
            "relative flex grow flex-col overflow-hidden",
            showFull || expandButton === false ? "max-h-none" : "max-h-[400px]",
          )}
        >
          {children}
          {!showFull && expandButton && (
            <div className="absolute inset-x-0 bottom-0 z-20 mt-[-70px]">
              <div className="to-background h-[50px] w-full bg-gradient-to-b from-transparent"></div>
              {/* <div className="h-[30px] w-full bg-gradient-to-b from-transparent to-background"></div> */}
              <button
                onClick={() => setShowFull(true)}
                className="center text-text bg-background hover:text-primary relative h-[30px] w-full text-sm transition-all"
              >
                <div className="flex items-end justify-center pb-1.5">
                  Show more
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {!!contentTags?.length ? (
            <div className="mb-2.5 mt-1 max-h-[52px] overflow-hidden">
              <Tags tags={contentTags} />
            </div>
          ) : (
            <div className="h-1.5" />
          )}
          <div className="border-t">
            <Actions event={event} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
