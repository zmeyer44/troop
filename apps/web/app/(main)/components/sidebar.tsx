"use client";
import useDimensions from "@/lib/hooks/useElementSize";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

type SidebarProps = {
  title: string;
  titleClassName?: string;
  subtitle?: string;
  children?: ReactNode;
};
export default function Sidebar({
  title,
  titleClassName,
  subtitle,
  children = null,
}: SidebarProps) {
  const [dims, ref] = useDimensions();
  return (
    <div
      ref={ref}
      className={cn(
        "sticky top-0 hidden w-full shrink-0 gap-y-6 lg:flex lg:w-[250px] xl:w-[270px]",
      )}
      style={{
        height: dims.height ? `${dims.height}px` : "auto",
      }}
    >
      {/* <Separator orientation="vertical" className="hidden lg:block" /> */}
      <div className="flex flex-col gap-y-3 p-3 pt-4">
        <div className="flex flex-col space-y-1.5">
          <h3
            className={cn(
              "font-cal font-semibold leading-none",
              titleClassName,
            )}
          >
            {title}
          </h3>
          {!!subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
