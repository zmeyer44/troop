"use client";
import useProfile from "@/lib/hooks/useProfile";
import ProfileAvatar from "@/components/profileAvatar";
import type { CalendarEvent } from "@repo/database";
import { cn, truncateText } from "@/lib/utils";
import { LuChevronRight } from "react-icons/lu";
import HostsSection from "./HostsSection";
import InfoSection from "./InfoSection";

export default function PresentedBySection({
  event,
  className,
}: {
  event: CalendarEvent;
  className?: string;
}) {
  const profileData = useProfile(event.pubkey);
  return (
    <div className={cn("space-y-3", className)}>
      {/* Calendar */}
      <div className="flex items-center gap-3">
        <ProfileAvatar {...profileData} className="size-10 rounded-md" />

        <div className="flex flex-col justify-center">
          <span className="text-muted-foreground text-xs">Presented by</span>
          <div className="flex items-center gap-x-1">
            <h4 className="text-sm font-medium leading-tight">
              {profileData.profile?.name ?? truncateText(profileData.npub)}
            </h4>
            <LuChevronRight className="text-muted-foreground size-4" />
          </div>
        </div>
      </div>
      {/* Hosts Section */}
      <InfoSection title={"Hosted By"}>
        <HostsSection pubkeys={[event.pubkey]} />
      </InfoSection>
      {/* Attendees Section */}
      <InfoSection title={"Attendees"}>
        <HostsSection pubkeys={[event.pubkey]} />
      </InfoSection>
    </div>
  );
}

export function CalendarLink({
  event,
  className,
}: {
  event: CalendarEvent;
  className?: string;
}) {
  const profileData = useProfile(event.pubkey);
  return (
    <div className="flex items-center gap-2">
      <ProfileAvatar {...profileData} className="size-5 rounded" />
      <div className="flex items-center gap-x-1">
        <h4 className="text-sm font-medium leading-tight">
          {profileData.profile?.name ?? truncateText(profileData.npub)}
        </h4>
        <LuChevronRight className="text-muted-foreground size-4" />
      </div>
    </div>
  );
}
