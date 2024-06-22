import Globe from "./components/Globe";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo";
import Link from "next/link";
import { prisma } from "@repo/database";
export default async function LandingPage() {
  const events = await prisma.calendarEvent.findMany({
    where: {
      start: {
        gte: Math.floor(new Date().getTime() / 1000),
        lte: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 31,
      },
      geohash: {
        not: null,
      },
    },
  });
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-between gap-3 overflow-hidden p-4 md:flex-row md:gap-x-8 md:pt-12">
      <div className="mt-4 flex max-w-md shrink flex-col items-center text-center sm:max-w-lg md:-mt-8 md:max-w-md md:items-start md:text-left">
        <div className="text-muted-foreground/40 font-cal mb-4 flex items-center gap-x-2 text-2xl md:text-3xl">
          <Logo className="text-primary size-6 md:size-7" />
          <span>troop</span>
        </div>
        <h1 className="font-cal mb-2 text-4xl sm:mb-4 sm:text-5xl md:text-6xl">
          All Your Events Live here
        </h1>
        <div className="text-muted-foreground text-base md:text-lg">
          Troop is the home for all of you events! We are Nostr native so all
          data is stored across Nostr relays.
        </div>
        <div className="pt-4 sm:pt-6">
          <Link href={"/home"}>
            <Button size={"lg"}>Start Exploring</Button>
          </Link>
        </div>
      </div>
      <div className="relative mx-[-50px] -mb-4 flex h-auto w-[calc(90%_+_100px)] flex-1 shrink-0 flex-col sm:mx-auto md:mr-[-40px] md:h-[64vw] md:w-[60vw] lg:mr-[-50px] lg:h-[663px] lg:w-[620px]">
        <Globe events={events} />
      </div>
    </div>
  );
}
