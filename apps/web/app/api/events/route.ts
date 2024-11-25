import { prisma } from "@repo/database";
import { NextResponse } from "next/server";
async function handler(req: Request) {
  const eventsReceived = await prisma.calendarEvent.findMany({
    where: {
      start: {
        gt: Math.floor(new Date().getTime() / 1000),
      },
      image: {
        not: null,
      },
    },
    orderBy: {
      start: "asc",
    },
    take: 100,
    include: {
      tags: true,
    },
  });
  return NextResponse.json(eventsReceived);
}
export { handler as GET };
