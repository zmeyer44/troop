"use server";
import { nanoid } from "nanoid";
import { server } from "@passwordless-id/webauthn";
import { prisma } from "@repo/database";

export async function getChallenge() {
  return {
    challenge: nanoid(10),
    credentialId: "",
  };
}
export async function verifyCredential(credentialId: string) {
  const challenge = await prisma.verificationToken.findFirstOrThrow({
    where: {
      identifier: "",
    },
  });
  const credentialKey = await prisma;
  const expected = {
    challenge: challenge.token,
    origin: "https://www.troop.is",
    userVerified: true,
  };
  //   const authenticationParsed = await server.verifyAuthentication({}, "", {
  //     challenge: "",
  //     origin: "https://www.troop.is",
  //     userVerified: true,
  //   });
}
