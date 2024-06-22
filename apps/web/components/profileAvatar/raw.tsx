import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  image?: string | null;
  name: string;
  className?: string;
};
export default function RawProfileAvatar({
  image,
  name,
  className = "size-9",
}: ProfileAvatarProps) {
  return (
    <Avatar className={cn("bg-muted", className)}>
      <AvatarImage src={image ?? undefined} />
      <AvatarFallback className={cn("bg-muted", className)}>
        {name.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}
