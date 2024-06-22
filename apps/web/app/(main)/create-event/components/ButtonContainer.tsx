"use client";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonContainerProps = ComponentProps<"div">;
export default function ButtonContainer({
  className,
  children,
  ...props
}: ButtonContainerProps) {
  return (
    <div
      className={cn(
        "bg-muted hover:bg-muted-foreground/10 hover:border-border cursor-pointer rounded-lg border border-transparent p-3 transition-all",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
