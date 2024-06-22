"use client";
import { cn } from "@/lib/utils";
import { modal } from "@/app/providers/modal";
import useProfile from "@/lib/hooks/useProfile";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/modals/auth";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthActions() {
  const { currentUser } = useCurrentUser();

  if (currentUser) {
    return <CurrentUserOptions pubkey={currentUser.pubkey} />;
  }
  return (
    <Button
      size={"sm"}
      onClick={() =>
        modal.show(<AuthModal />, {
          id: "auth",
        })
      }
    >
      Sign In
    </Button>
  );
}

function CurrentUserOptions({ pubkey }: { pubkey: string }) {
  const { logout } = useCurrentUser();
  const { profile, npub } = useProfile(pubkey);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar className="size-[36px]">
            <AvatarImage src={profile?.picture ?? undefined} />
            <AvatarFallback>
              {profile?.name
                .split(" ")
                .map((t) => t.slice(0, 1))
                .join("")
                .slice(0, 2) ?? npub.slice(5, 7)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
