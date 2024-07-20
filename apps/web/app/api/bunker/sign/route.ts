import { bunkerSign } from "@/actions/frostr/sign";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;
const BodySchema = z.object({
  eventHash: z.string(),
  clientNonceCommitmentPair: z.tuple([
    z.tuple([z.string(), z.string()]),
    z.tuple([z.string(), z.string()]),
  ]),
});

interface IParams {}
async function handler(req: Request, { params }: { params: IParams }) {
  console.log("CALLED", req);
  const bodyJson = await req.json();
  console.log("bodyJson", bodyJson);
  const parsedBody = BodySchema.parse(bodyJson);
  const { bunkerNonceCommitmentPair, bunkerSignature } =
    await bunkerSign(parsedBody);

  return NextResponse.json(
    { bunkerNonceCommitmentPair, bunkerSignature },
    {
      status: 200,
    },
  );
}

export { handler as POST };
