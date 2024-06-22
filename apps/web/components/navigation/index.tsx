"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { LuInbox, LuUserSquare, LuUserX, LuVideo } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const defaultIcons = {
  inbox: LuInbox,
  contacts: LuUserSquare,
  mute: LuUserX,
  videos: LuVideo,
} as const;

interface NavProps {
  isCollapsed?: boolean;
  links: {
    title: string;
    label?: string;
    icon: IconType | keyof typeof defaultIcons;
    variant: "default" | "ghost";
  }[];
}

export default function Nav({ links, isCollapsed = false }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const Icon =
            typeof link.icon === "string"
              ? defaultIcons[link.icon] ?? defaultIcons.inbox
              : link.icon;
          if (isCollapsed) {
            return (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ variant: link.variant, size: "icon" }),
                      "h-9 w-9",
                    )}
                  >
                    <Icon className="h-4 w-4" />

                    <span className="sr-only">{link.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  {link.label && (
                    <span className="text-muted-foreground ml-auto">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          } else {
            return (
              <Link
                key={index}
                href="#"
                className={cn(
                  buttonVariants({ variant: link.variant, size: "sm" }),
                  "justify-start gap-x-2",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="min-w-0 truncate">{link.title}</span>
                {link.label && (
                  <span
                    className={cn(
                      "ml-auto",
                      link.variant === "default" && "text-background",
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </Link>
            );
          }
        })}
      </nav>
    </div>
  );
}
