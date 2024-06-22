import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HiCheckBadge, HiMiniKey } from "react-icons/hi2";
import Link from "next/link";
import useProfile from "@/lib/hooks/useProfile";
import { nip19 } from "nostr-tools";
import { getTwoLetters, getNameToShow } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileHeaderProps = {
  pubkey: string;
  locked?: boolean;
};
export default function ProfileHeader({ pubkey, locked }: ProfileHeaderProps) {
  const { profile } = useProfile(pubkey);
  const npub = nip19.npubEncode(pubkey);
  return (
    <Link href={`/${npub}`} className="center group gap-x-3">
      <Avatar className="center bg-muted @md:h-10 @md:w-10 h-9 w-9 overflow-hidden rounded-sm">
        <AvatarImage
          src={profile?.picture ?? undefined}
          alt={profile?.name ?? npub}
        />
        <AvatarFallback className="text-xs">
          {getTwoLetters({ npub, profile })}
        </AvatarFallback>
      </Avatar>
      {profile?.name ? (
        <div className="flex flex-col gap-0">
          <div className="flex items-center  gap-1">
            <span className="text-foreground line-clamp-1 text-sm font-medium group-hover:underline">
              {getNameToShow({ npub, profile })}
            </span>
            {!!profile?.nip05 && (
              <HiCheckBadge className="text-primary h-4 w-4" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {!!profile.nip05 && (
              <span className="text-muted-foreground line-clamp-1 text-[11px]">
                {profile.nip05}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center  gap-1">
          <span className="text-foreground line-clamp-1 text-sm uppercase group-hover:underline">
            {getNameToShow({ npub, profile })}
          </span>
          {!!profile?.nip05 && (
            <HiCheckBadge className="text-primary h-4 w-4" />
          )}
        </div>
      )}
    </Link>
  );
}

export function LoadingProfileHeader() {
  return (
    <div className="center group gap-x-3">
      <Avatar className="center bg-muted @md:h-10 @md:w-10 h-9 w-9 overflow-hidden rounded-sm"></Avatar>
      <div className="space-y-1">
        <Skeleton className="bg-muted h-2.5 w-[70px]" />
        <Skeleton className="bg-muted h-2.5 w-[100px]" />
      </div>
    </div>
  );
}
