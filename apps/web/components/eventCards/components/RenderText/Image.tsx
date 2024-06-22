import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ImageUrl({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <Image
        alt="Image"
        height="288"
        width="288"
        unoptimized
        src={url}
        className={cn(
          "bg-background h-full rounded-xl object-cover object-center",
        )}
      />
    </div>
  );
}
