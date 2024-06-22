import { type Event } from "nostr-tools";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";

export const DUMMY_1: Event = {
  id: "test",
  content:
    "Envisioning a future of a Signal-grade private social network, where you have local llms privately translating, summarizing, and building algos of your feed. It’s not far off, we have the technology today. damn this is cool and cyberpunk af.",
  kind: 1,
  pubkey: "f7234bd4c1394dda46d09f35bd384dd30cc552ad5541990f98844fb06676e9ca",
  sig: "wetwet",
  tags: [["t", "nostr"]],
  created_at: unixTimeNowInSeconds() - 3600,
};
export const PUBKEY =
  "f7234bd4c1394dda46d09f35bd384dd30cc552ad5541990f98844fb06676e9ca";
export const DUMMY_30023: Event = {
  kind: 30023,
  created_at: 1675642635,
  content:
    "Lorem [ipsum][nostr:nevent1qqst8cujky046negxgwwm5ynqwn53t8aqjr6afd8g59nfqwxpdhylpcpzamhxue69uhhyetvv9ujuetcv9khqmr99e3k7mg8arnc9] dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nRead more at nostr:naddr1qqzkjurnw4ksz9thwden5te0wfjkccte9ehx7um5wghx7un8qgs2d90kkcq3nk2jry62dyf50k0h36rhpdtd594my40w9pkal876jxgrqsqqqa28pccpzu.",
  tags: [
    ["d", "lorem-ipsum"],
    ["title", "Lorem Ipsum"],
    ["published_at", "1296962229"],
    ["t", "placeholder"],
    ["t", "nostr"],
    [
      "e",
      "b3e392b11f5d4f28321cedd09303a748acfd0487aea5a7450b3481c60b6e4f87",
      "wss://relay.example.com",
    ],
    [
      "a",
      "30023:a695f6b60119d9521934a691347d9f78e8770b56da16bb255ee286ddf9fda919:ipsum",
      "wss://relay.nostr.org",
    ],
  ],
  pubkey: "f7234bd4c1394dda46d09f35bd384dd30cc552ad5541990f98844fb06676e9ca",
  id: "...",
  sig: "wetwet",
};
