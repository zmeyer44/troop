import { User } from "@repo/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  npub: string;
  profile?: User;
  className?: string;
};
export default function ProfileAvatar({
  npub,
  profile,
  className = "size-9",
}: ProfileAvatarProps) {
  return (
    <Avatar className={cn("bg-muted", className)}>
      <AvatarImage src={profile?.picture ?? undefined} />
      <AvatarFallback>
        {profile?.name
          .split(" ")
          .map((t) => t.slice(0, 1))
          .join("")
          .slice(0, 2) ?? npub.slice(5, 7)}
      </AvatarFallback>
    </Avatar>
  );
}
