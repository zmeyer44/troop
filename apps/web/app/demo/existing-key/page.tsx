"use client";
import { useState } from "react";
import { z } from "zod";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BsFillShieldLockFill } from "react-icons/bs";
import { client } from "@passwordless-id/webauthn";
import { getChallenge } from "@/actions/broker";
import { nip19, getEventHash, verifyEvent } from "nostr-tools";
import { G, Q, SingleSigner, Aggregator, Point } from "frost-ts";
import * as crypto from "crypto";
import { toast } from "@/components/ui/use-toast";
import { createZodFetcher } from "zod-fetch";

const fetchWithZod = createZodFetcher();
const BUNKER_URL = "https://troop.is/api/bunker/sign";

const BunkerResponseSchema = z.object({
  bunkerSignature: z.string(),
  bunkerNonceCommitmentPair: z.tuple([
    z.tuple([z.string(), z.string()]),
    z.tuple([z.string(), z.string()]),
  ]),
});
export default function Page() {
  const [pk, setPk] = useState("");
  const [keys, setKeys] = useState<{
    bunkerSecret: string;
    clientSecret: string;
    clientSecretNsec: string;
    rootPubkey: string;
  }>();
  async function handleGenerate() {
    let existingPK = pk;
    if (pk.startsWith("nsec")) {
      const decoded = nip19.decode(pk);
      if (decoded.type === "nsec") {
        existingPK = uint8ArrayToHexString(decoded.data);
      }
    }
    const a0 = BigInt(`0x${existingPK}`);
    const pubkey = G.multiply(a0);
    console.log(
      "Generating for ",
      nip19.npubEncode(pubkey.xonlySerialize().toString("hex")),
    );
    const a1 = BigInt(`0x${crypto.randomBytes(32).toString("hex")}`) % Q;
    const _bunkerKey = a0 + a1 * 1n;
    const _clientKey = a0 + a1 * 2n;
    setKeys({
      bunkerSecret: _bunkerKey.toString(16),
      clientSecret: _clientKey.toString(16),
      clientSecretNsec: nip19.nsecEncode(
        Buffer.from(_clientKey.toString(16), "hex"),
      ),
      rootPubkey: pubkey.xonlySerialize().toString("hex"),
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create key shares</CardTitle>
        <CardDescription>Let's set up sub keys</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Private Key</Label>
          <Input
            id="pk"
            placeholder="private key"
            type="password"
            value={pk}
            onChange={(e) => setPk(e.target.value)}
          />
        </div>
        {!!keys && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="client-key">Client nsec</Label>
              <Input id="client-key" value={keys.clientSecretNsec} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-key">Client Key</Label>
              <Input id="client-key" value={keys.clientSecret} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bunker-key">Bunker Key</Label>
              <Input id="bunker-key" value={keys.bunkerSecret} disabled />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} className="w-full">
          Generate
        </Button>
      </CardFooter>
    </Card>
  );
}

function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
