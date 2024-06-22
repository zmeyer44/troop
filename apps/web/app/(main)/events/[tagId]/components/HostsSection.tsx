"use client";
import ProfileAvatar from "@/components/profileAvatar";
import useProfile from "@/lib/hooks/useProfile";
import NostrLogo from "@/assets/icons/Nostr";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type HostsSectionProps = {
  pubkeys: string[];
};
export default function HostsSection({ pubkeys }: HostsSectionProps) {
  return (
    <ul className="w-full">
      {pubkeys.map((p) => (
        <li key={p} className="w-full">
          <HostLine pubkey={p} />
        </li>
      ))}
    </ul>
  );
}
function HostLine({ pubkey }: { pubkey: string }) {
  const { profile, npub } = useProfile(pubkey);
  return (
    <div className="flex w-full items-center gap-x-2">
      <ProfileAvatar npub={npub} profile={profile} className="size-7" />
      <div className="flex-1 shrink overflow-hidden">
        <p className="text-foreground truncate font-semibold">
          {profile?.name ?? npub}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <Button asChild size="icon" variant={"ghost"} className="text-primary">
          <Link href={`/${npub}`}>
            <NostrLogo className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
