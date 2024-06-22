"use client";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HiCheckBadge,
  HiOutlineHandThumbUp,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { HiOutlineLightningBolt } from "react-icons/hi";
import HeaderButtons, { FollowButton } from "./headerButtons";
import Link from "next/link";
import { copyText, truncateText } from "@/lib/utils";
import { MdContentCopy } from "react-icons/md";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@repo/database";
import { nip19 } from "nostr-tools";

type BannerSectionProps = {
  profile: User;
};
export default function BannerSection({ profile }: BannerSectionProps) {
  const { toast } = useToast();
  const npub = nip19.npubEncode(profile.pubkey);
  return (
    <div className="bg-foreground- z-20 w-full overflow-hidden rounded-lg border">
      <BannerImage image={profile.banner} />
      <div className="@md/main:px-4 @md/main:pt-2.5 flex flex-wrap justify-between gap-3 px-2.5 pb-3 pt-0">
        <div className="flex">
          <div className="@md/main:mt-[-28px] @lg/main:mt-[-30px] @md/main:mr-3 mr-2.5 mt-[-22px]">
            <div className="@md/main:w-[70px] @md/main:h-[70px] @lg/main:w-[80px] @lg/main:h-[80px] relative aspect-square h-[60px] w-[60px] overflow-hidden rounded-full ring-0">
              <div className="h-full w-full">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile.picture ?? undefined} />
                  <AvatarFallback>ZM</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          <div className="">
            <h2 className="text-foreground font-cal @md/main:text-lg @lg/main:text-lx @md/main:leading-6 text-base font-semibold leading-5">
              {profile?.name ?? "Unnamed"}
            </h2>
            {profile.nip05 && (
              <div className="flex items-center gap-1">
                <p className="text-muted-foreground @md/main:text-xs text-[11px]">
                  {profile.nip05}
                </p>
                <HiCheckBadge className="text-primary h-3 w-3" />
              </div>
            )}
            <button
              onClick={() => {
                void copyText(npub);
                toast({
                  title: `Copied npub`,
                });
              }}
              className="flex items-center gap-1 hover:underline"
            >
              <span className="text-muted-foreground @md/main:text-xs line-clamp-1 text-[11px]">
                {truncateText(npub, 5)}
              </span>
              <MdContentCopy className="text-primary @md/main:size-3 size-2.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <HeaderButtons>
            <FollowButton className="@md/main:flex hidden" />
          </HeaderButtons>
        </div>
        <FollowButton className="@md/main:hidden w-full" />
      </div>
    </div>
  );
}

export function BannerImage({ image }: { image?: string | null }) {
  return (
    <div className="from-primary relative min-h-[75px] w-full overflow-hidden rounded-xl bg-gradient-to-b pb-[calc(clamp(75px,21%,200px))]">
      {!!image && (
        <div className="from-primary to-frosted absolute inset-0 bg-gradient-to-t">
          <Image
            src={image}
            alt={"banner image"}
            fill
            unoptimized
            objectFit="cover"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
