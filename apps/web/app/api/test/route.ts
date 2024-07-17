import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
async function handler(req: Request) {
  // const session = await getSession();
  // if (!session?.user.id) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }
  const data = await prisma.calendarEvent.count({
    where: {},
  });

  return NextResponse.json({ data });
}

export { handler as GET };
