"use client";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LuSearch } from "react-icons/lu";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function ConversationsList() {
  return (
    <div
      className="@xl/main:flex relative hidden h-full flex-col items-start gap-8"
      x-chunk="dashboard-03-chunk-0"
    >
      <form className="flex w-full flex-1 flex-col items-start gap-6">
        <fieldset className="grid gap-3 rounded-lg border p-4 pt-2">
          <legend className="-ml-1 px-1 text-sm font-medium">Favorites</legend>
          <div className="scrollbar-none -mx-4 grid overflow-x-auto">
            <div className="flex w-full gap-3 px-3">
              {["", "", "", "", "", "", ""].map((u) => (
                <div className="">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>
        </fieldset>
        <fieldset className="grid gap-6 rounded-lg border p-4 pb-0 pt-2">
          <legend className="-ml-1 px-1 text-sm font-medium">
            Conversations
          </legend>

          <div className="-mx-4 grid">
            <div className="px-3">
              <form>
                <div className="relative">
                  <LuSearch className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <ScrollArea className="max-h-[calc(100vh_-_300px)]">
              <div className="flex flex-col gap-2 p-3">
                {[
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "Test User",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                  {
                    name: "James Monroe",
                    body: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio nobis eius voluptas minus commodi! Delectus, quae assumenda iusto, veniam eaque magni fugit praesentium dolorem nemo facere hic voluptate illo consectetur.",
                  },
                ].map((i) => (
                  <ConversationCard key={i.name} {...i} onSelect={() => {}} />
                ))}
              </div>
            </ScrollArea>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/utils/dates";
type ConversationCardProps = {
  selected?: boolean;
  onSelect: () => void;
  name: string;
  body: string;
  read?: boolean;
};
export function ConversationCard({
  selected,
  onSelect,
  name,
  body,
  read,
}: ConversationCardProps) {
  return (
    <button
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
        selected && "bg-muted",
      )}
      onClick={onSelect}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{name}</div>
            {!read && <span className="bg-primary flex h-2 w-2 rounded-full" />}
          </div>
          <div
            className={cn(
              "ml-auto text-xs",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {relativeTime(new Date())}
          </div>
        </div>
        {/* <div className="text-xs font-medium">{item.subject}</div> */}
      </div>
      <div className="text-muted-foreground line-clamp-2 text-xs">
        {body.substring(0, 300)}
      </div>
      {/* {item.labels.length ? (
    <div className="flex items-center gap-2">
      {item.labels.map((label) => (
        <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
          {label}
        </Badge>
      ))}
    </div>
  ) : null} */}
    </button>
  );
}
