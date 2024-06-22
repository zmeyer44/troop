import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const topics = [
  {
    label: "Bitcoin",
    value: "bitcoin",
  },
  {
    label: "Sports",
    value: "sports",
  },
  {
    label: "Macro",
    value: "macro",
  },
  {
    label: "Nostr",
    value: "nostr",
  },
  {
    label: "Tech",
    value: "tech",
  },
  {
    label: "Politics",
    value: "politics",
  },
  {
    label: "Crypto",
    value: "crypto",
  },
  {
    label: "Surfing",
    value: "surfing",
  },
  {
    label: "Music",
    value: "music",
  },
  {
    label: "Podcasts",
    value: "podcasts",
  },
];

export default function Topics() {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-3 p-3 pb-0">
        {topics.map((topic) => (
          <button
            key={topic.value}
            className="bg-muted text-muted-foreground hover:bg-muted/50 rounded-[5px] px-4 py-1"
          >
            <p className="text-sm font-semibold">{topic.label}</p>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="translate-y-2" />
    </ScrollArea>
  );
}
