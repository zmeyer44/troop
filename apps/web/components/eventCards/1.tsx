"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { cn, copyText } from "@/lib/utils";
import Container from "./components/Container";
import { nip19 } from "nostr-tools";
import { type KindCardProps } from "./";
import { useToast } from "@/components/ui/use-toast";
import { getTagsValues } from "@/lib/utils/nostr";
import { RenderText } from "./components/RenderText";

export default function Kind1(props: KindCardProps) {
  const { content, pubkey, tags, created_at: createdAt } = props;
  const r = getTagsValues("r", tags).filter(Boolean);
  const npub = nip19.npubEncode(pubkey);
  const { toast } = useToast();
  return (
    <Container
      event={props}
      actionOptions={[
        {
          label: "View profile",
          href: `/${npub}`,
          type: "link",
        },
        {
          label: "Copy raw data",
          type: "button",
          onClick: () => {
            void copyText(JSON.stringify(props));
            toast({
              title: "Copied Text!",
            });
          },
        },
      ]}
    >
      <CardDescription className="text-card-foreground text-sm font-normal">
        <RenderText text={content} />
      </CardDescription>
      {!!r.length && (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {/* {r.map((url, idx) => (
            <LinkCard key={idx} url={url} className="max-w-[250px]" />
          ))} */}
        </div>
      )}
    </Container>
  );
}
