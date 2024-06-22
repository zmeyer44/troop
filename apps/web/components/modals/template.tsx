"use client";

import { ReactNode } from "react";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerBody,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { modal } from "@/app/providers/modal";
import { HiX } from "react-icons/hi";

type TemplateProps = {
  children: ReactNode;
  footer?: () => ReactNode;
  title?: string;
  description?: string;
  className?: string;
  closeButton?: boolean;
};

export default function Template({
  children,
  footer: Footer,
  title,
  description,
  className,
  closeButton = false,
}: TemplateProps) {
  return (
    <div className={cn("p-4", className)}>
      {!!title && (
        <DrawerHeader>
          <DrawerTitle className="text-xl">{title}</DrawerTitle>
          {!!description && (
            <DrawerDescription>{description}</DrawerDescription>
          )}
        </DrawerHeader>
      )}
      <DrawerBody className="px-0">{children}</DrawerBody>
      {!!Footer && (
        <DrawerFooter>
          <Footer />
        </DrawerFooter>
      )}
      {closeButton && (
        <button
          onClick={() => modal.dismiss()}
          className="text-muted-foreground hover:text-primary absolute right-4 top-4 hidden transition-all md:flex"
        >
          <HiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
