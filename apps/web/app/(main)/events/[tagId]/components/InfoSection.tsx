import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};
export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="">
      <h3 className="text-muted-foreground mb-1 text-sm font-semibold">
        {title}
      </h3>
      <Separator />
      <div className="mt-2">{children}</div>
    </div>
  );
}
