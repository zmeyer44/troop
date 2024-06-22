"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import {
  IoArrowUpOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoSearch,
  IoAlbums,
  IoAlbumsOutline,
  IoBookmarks,
  IoBookmarksOutline,
  IoCalendarNumberSharp,
  IoChatbubbles,
  IoChatbubblesOutline,
  IoCompass,
  IoCompassOutline,
  IoRadio,
  IoVideocam,
  IoText,
  IoMic,
  IoMicOutline,
} from "react-icons/io5";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MobileNavigation() {
  const pathname = usePathname();
  const [snap, setSnap] = useState<number | string | null>("160px");

  return (
    <Drawer.Root
      snapPoints={["160px", "355px", 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={true}
    >
      <Drawer.Trigger asChild>
        {/* <button>Open Drawer</button> */}
        <Button size={"sm"} className="h-7 rounded-full px-4">
          <IoArrowUpOutline className="size-5" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Overlay className="z-modal fixed inset-0 bg-black/40" />
      <Drawer.Portal>
        <Drawer.Content
          className={cn(
            "z-modal fixed bottom-0 left-0 right-0 mx-[-1px] flex h-full max-h-[97%] flex-col rounded-t-[10px] ",
            {
              "border-gray-200 border-b-none bg-frosted-80 border backdrop-blur-lg":
                false,
              "bg-primary": true,
            },
          )}
        >
          <div className="bg-frosted-30 mx-auto mt-2.5 h-1.5 w-12 rounded-full" />

          <div
            className={cn("mx-auto flex w-full max-w-md flex-col p-4 pt-2.5", {
              "overflow-y-auto": snap === 1,
              "overflow-hidden": snap !== 1,
            })}
          >
            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  href: "/",
                  icon: (props: any) => <IoAlbums {...props} />,
                },
                {
                  href: "/lists",
                  icon: (props: any) => <IoBookmarks {...props} />,
                },
                {
                  href: "/events",
                  icon: (props: any) => <IoCalendarNumberSharp {...props} />,
                },
                {
                  href: "/chat",
                  icon: (props: any) => <IoChatbubbles {...props} />,
                },
                {
                  href: "/nests",
                  icon: (props: any) => <IoMic {...props} />,
                },
                {
                  href: "/live",
                  icon: (props: any) => <IoRadio {...props} />,
                },
                {
                  href: "/videos",
                  icon: (props: any) => <IoVideocam {...props} />,
                },
                {
                  href: "/long-form",
                  icon: (props: any) => <IoText {...props} />,
                },
              ].map(({ href, icon: Icon }) => (
                <Button
                  key={`nav-item-${href}`}
                  variant={href === pathname ? "frosted-active" : "frosted"}
                  size={"icon"}
                  asChild
                  className="h-12 w-full"
                >
                  <Link href={href}>
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              ))}
            </div>
            {/* Seperator */}
            <div className="py-3">
              <Separator className="bg-frosted" />
            </div>
            {/* User Info */}
            <div className="">
              <div className="flex items-center gap-x-2.5">
                <div className="">
                  <Avatar className="h-12 w-12">
                    <AvatarImage />
                    <AvatarFallback className="bg-frosted text-frosted-foreground">
                      ZM
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-frosted-foreground">
                  <h3 className="font-cal text-frosted-active font-semibold">
                    Zach Meyer
                  </h3>
                  <p className="mb-1 text-xs leading-3">zach@omni.run</p>
                </div>
              </div>
              {/* Bio */}
              <p className="text-frosted-foreground line-clamp-3 pt-1 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Consequuntur eum rem molestias eos unde? Sequi obcaecati omnis
                iste molestias! Aut consequuntur doloremque cumque ea cupiditate
                ipsum quae reiciendis, in laborum!
              </p>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
