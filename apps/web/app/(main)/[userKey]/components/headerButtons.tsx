"use client";
import { Button } from "@/components/ui/button";
import {
  HiOutlineHandThumbUp,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { RiUserAddLine } from "react-icons/ri";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderButtonsProps = {
  children?: ReactNode;
};
export default function HeaderButtons({ children }: HeaderButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Button size={"sm"} variant={"ghost"} className="gap-x-1.5 px-2">
          <HiOutlineLightningBolt className="h-4 w-4" />
        </Button>
        <Button size={"sm"} variant={"ghost"} className="gap-x-1.5 px-2">
          <HiOutlineChatBubbleLeftEllipsis className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}
export function FollowButton({ className }: { className?: string }) {
  return (
    <Button
      onClick={(e) => {
        console.log("captured");
        // modal?.show(<ZapPicker event={event} />);
      }}
      size={"sm"}
      className={cn("gap-x-1.5", className)}
    >
      <RiUserAddLine className="h-4 w-4" />
      <span>Follow</span>
    </Button>
  );
}
