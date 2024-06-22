import Logo from "@/assets/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="text-foreground font-cal flex items-center gap-x-2 text-xl sm:text-2xl">
          <Logo className="text-primary size-5 sm:size-6" />
          <span>troop</span>
        </div>
        <div className="center ml-auto gap-x-2">
          <Link href={"/create-event"}>
            <Button variant={"ghost"}>Create event</Button>
          </Link>
          <Link href={"/home"}>
            <Button>Dive In</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
