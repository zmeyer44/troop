"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

import {
  LuHome,
  LuLineChart,
  LuPackage,
  LuPackage2,
  LuSettings,
  LuShoppingCart,
  LuUsers2,
} from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useRoutes from "@/lib/navigation/useRoutes";
import Logo from "@/assets/logo";
export default function Navigation() {
  const { sidebar, settings } = useRoutes();
  return (
    <aside className="bg-background fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="#"
          className="bg-primary text-primary-foreground group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
        >
          <Logo className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Olli</span>
        </Link>
        {sidebar.routes.map((route) => (
          <Tooltip key={route.href}>
            <TooltipTrigger asChild>
              <Link
                href={route.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                  route.active &&
                    "text-accent-foreground hover:text-foreground bg-accent",
                )}
              >
                <route.icon className="h-5 w-5" />
                <span className="sr-only">{route.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{route.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
        {settings.routes.map((route) => (
          <Tooltip key={route.href}>
            <TooltipTrigger asChild>
              <Link
                href={route.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                  route.active &&
                    "text-accent-foreground hover:text-foreground bg-accent",
                )}
              >
                <LuSettings className="h-5 w-5" />
                <span className="sr-only">{route.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{route.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </aside>
  );
}
