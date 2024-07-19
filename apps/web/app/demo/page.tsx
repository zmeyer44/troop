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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { MdOutlineDiamond } from "react-icons/md";
import { cn } from "@/lib/utils";
import {
  RiSafe2Fill as Bunker,
  RiSafeFill as Bunker2,
  RiSmartphoneFill as Client,
  RiAnchorFill as Root,
} from "react-icons/ri";
import { PiDevicesFill } from "react-icons/pi";
import { Textarea } from "@/components/ui/textarea";
import { bunkerSign } from "@/actions/frostr/sign";
import {
  getEventHash,
  verifyEvent,
  validateEvent,
  getPublicKey,
  generateSecretKey,
  nip19,
} from "nostr-tools";
import { useNDK } from "../providers/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { BsFillShieldLockFill } from "react-icons/bs";
import { LuUserCircle2 } from "react-icons/lu";

export default function GeneratorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ndk } = useNDK();
  const [step, setStep] = useState<
    "root" | "bunker" | "client" | "kind-0" | "kind-0-published" | "kind-1"
  >("root");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kind0Data, setKind0Data] = useState({
    name: "",
    about: "",
    picture: "",
    banner: "",
  });
  const [keys, setKeys] = useState<{
    rootPubkey: string;
    rootSecret: string;
    bunkerSecret: string;
    clientSecret: string;
  }>();

  const [content, setContent] = useState("");

  function handleGenerate() {
    setKeys(createKeys());
  }

  async function handlePublishEvent(
    event: {
      pubkey: string;
      content: string;
      kind: number;
      tags: string[][];
    },
    _clientKey: string,
  ) {
    setIsSubmitting(true);
    try {
      const clientKey = BigInt(`0x${_clientKey}`);
      const nostrEvent = {
        ...event,
        created_at: unixTimeNowInSeconds(),
      };
      const valid = validateEvent(nostrEvent);
      if (!valid) {
        throw new Error("Invalid event");
      }
      const eventHash = getEventHash(nostrEvent);
      const messageBuffer = Buffer.from(eventHash, "hex");
      const participant_indexes = [1, 2];
      const pubkey = Point.xonly_deserialize(Buffer.from(event.pubkey, "hex"));
      const client = new SingleSigner(2, 2, 2, clientKey, pubkey);
      client.generate_nonce_pair();

      const client_nonce_commitment_pair = client.nonce_commitment_pair!.map(
        (c) => [c.x!.toString(16), c.y!.toString(16)],
      ) as [[string, string], [string, string]];
      const { bunker_nonce_commitment_pair, bunker_signature } =
        await bunkerSign({
          eventHash,
          client_nonce_commitment_pair,
        });
      const agg = new Aggregator(
        pubkey,
        messageBuffer,
        [
          bunker_nonce_commitment_pair.map(
            ([x, y]) => new Point(BigInt(`0x${x}`), BigInt(`0x${y}`)),
          ) as [Point, Point],
          client.nonce_commitment_pair!,
        ],
        participant_indexes,
      );
      const [message, nonce_commitment_pairs] = agg.signing_inputs();

      const sClient = client.sign(
        message,
        nonce_commitment_pairs,
        participant_indexes,
      );

      const rawSig = agg.signature([BigInt(`0x${bunker_signature}`), sClient]);
      const hexSig = rawSig.toString("hex");
      const eventToPublish = {
        ...nostrEvent,
        id: eventHash,
        sig: hexSig,
      };

      const validEvent = verifyEvent(eventToPublish);
      if (!validEvent) {
        throw new Error("Unable to generate valid event");
      }
      const ndkEvent = new NDKEvent(ndk, eventToPublish);

      await ndkEvent.publish();
      toast({
        title: "Event Published!",
        description: "Your event has been successfully published to relays.",
      });
      if (eventToPublish.kind === 0) {
        setStep("kind-0-published");
      } else {
        setContent("");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem publishing your event.",
      });
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (keys) {
    if (step === "kind-0") {
      return (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create an event</CardTitle>
            <CardDescription>Let's set up your Kind 0</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={kind0Data.name}
                onChange={(e) =>
                  setKind0Data((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">About</Label>
              <Textarea
                id="about"
                placeholder="Tell us about yourself"
                value={kind0Data.about}
                onChange={(e) =>
                  setKind0Data((prev) => ({ ...prev, about: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Picture url</Label>
              <Input
                id="picture"
                placeholder="https://..."
                value={kind0Data.picture}
                onChange={(e) =>
                  setKind0Data((prev) => ({ ...prev, picture: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Client Key</Label>
              <Input id="client-key" value={keys.clientSecret} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              loading={isSubmitting}
              onClick={() =>
                void handlePublishEvent(
                  {
                    content: JSON.stringify({
                      name: kind0Data.name,
                      about: kind0Data.about,
                      picture: kind0Data.picture,
                      displayName: kind0Data.name,
                    }),
                    kind: 0,
                    pubkey: keys.rootPubkey,
                    tags: [],
                  },
                  keys.clientSecret,
                )
              }
              className="w-full"
            >
              Publish
            </Button>
          </CardFooter>
        </Card>
      );
    } else if (step === "kind-0-published") {
      return (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Kind 0 Published!</CardTitle>
            <CardDescription>Checkout your new profile</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-x-3">
              <LuUserCircle2 className="size-10 shrink-0" />
              <div className="text-sm">
                <p className="break-all">{nip19.npubEncode(keys.rootPubkey)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep("kind-1")} className="w-full">
              Create another Event
            </Button>
          </CardFooter>
        </Card>
      );
    } else if (step === "kind-1") {
      return (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create an event</CardTitle>
            <CardDescription>Start posting on Nostr</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Note</Label>
              <Textarea
                id="note"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Client Key</Label>
              <Input id="client-key" value={keys.clientSecret} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              loading={isSubmitting}
              onClick={() =>
                void handlePublishEvent(
                  {
                    content: content,
                    kind: 1,
                    pubkey: keys.rootPubkey,
                    tags: [],
                  },
                  keys.clientSecret,
                )
              }
              className="w-full"
            >
              Publish
            </Button>
          </CardFooter>
        </Card>
      );
    }
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Keys Generated</CardTitle>
          <CardDescription>Be sure to save all keys safely</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div defaultValue={step} className="grid grid-cols-3 gap-4">
            <div>
              <button
                onClick={() => setStep("root")}
                className={cn(
                  "border-muted bg-popover hover:text-accent-foreground text-foreground flex w-full flex-col items-center justify-between rounded-md border-2 p-4 text-sm font-medium leading-none hover:bg-accent",
                  step === "root" && "border-primary ",
                )}
              >
                <MdOutlineDiamond className="mb-3 h-6 w-6" />
                Root
              </button>
            </div>
            <div>
              <button
                onClick={() => setStep("bunker")}
                className={cn(
                  "border-muted bg-popover hover:text-accent-foreground text-foreground flex w-full flex-col items-center justify-between rounded-md border-2 p-4 text-sm font-medium leading-none hover:bg-accent",
                  step === "bunker" && "border-primary ",
                )}
              >
                <Bunker2 className="mb-3 h-6 w-6" />
                Bunker
              </button>
            </div>
            <div>
              <button
                onClick={() => setStep("client")}
                className={cn(
                  "border-muted bg-popover hover:text-accent-foreground text-foreground flex w-full flex-col items-center justify-between rounded-md border-2 p-4 text-sm font-medium leading-none hover:bg-accent",
                  step === "client" && "border-primary ",
                )}
              >
                <PiDevicesFill className="mb-3 h-6 w-6" />
                Client
              </button>
            </div>
          </div>
          {step === "root" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Pubkey</Label>
                <Input
                  id="pubkey"
                  placeholder="First Last"
                  value={keys.rootPubkey}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Private Key</Label>
                <Input
                  id="root-key"
                  placeholder="First Last"
                  value={keys.rootSecret}
                />
              </div>
            </>
          ) : step === "bunker" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Bunker Key</Label>
                <Input
                  id="bunker-key"
                  placeholder="First Last"
                  value={keys.bunkerSecret}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Root Pubkey</Label>
                <Input
                  id="pubkey"
                  placeholder="First Last"
                  value={keys.rootPubkey}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Client Key</Label>
                <Input
                  id="client-key"
                  placeholder="First Last"
                  value={keys.clientSecret}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() =>
              setStep((prev) => {
                if (prev === "root") {
                  return "bunker";
                } else if (prev === "bunker") {
                  return "client";
                }
                return "kind-0";
              })
            }
            className="w-full"
          >
            {step === "client" ? "Let's Create an Event" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Generate Keys</CardTitle>
        <CardDescription>Be sure to save all keys safely</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center gap-x-3">
          <BsFillShieldLockFill className="size-10 shrink-0" />
          <div className="text-sm">
            <p>Trust-minimized Nsecbunker using FROST signature scheme</p>
            <span className="text-destructive text-xs leading-none">
              For testing purposes only!
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} className="w-full">
          Generate
        </Button>
      </CardFooter>
    </Card>
  );
}

import {
  Participant,
  SingleSigner,
  Aggregator,
  Point,
  G,
  Q,
} from "@repo/frost";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";
function createKeys() {
  const p1 = new Participant(1, 2, 2);
  p1.init_keygen();
  const singlePubkey = p1.derive_public_key([]);
  p1.generate_shares();
  const rootKey = p1.coefficients![0];
  const pubkey = G.multiply(rootKey);
  const bunkerKey = p1.coefficients![0] + p1.coefficients![1] * 1n;
  const clientKey = p1.coefficients![0] + p1.coefficients![1] * 2n;
  return {
    rootPubkey: pubkey.xonly_serialize().toString("hex"),
    rootSecret: rootKey.toString(16),
    bunkerSecret: bunkerKey.toString(16),
    clientSecret: clientKey.toString(16),
  };
}
function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
