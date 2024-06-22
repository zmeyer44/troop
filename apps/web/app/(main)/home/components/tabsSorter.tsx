"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "latest", label: "Latest" },
  { value: "top", label: "Top" },
  { value: "featured", label: "Featured" },
] as const;
type TabsSorterProps = {
  className?: string;
  tabClassName?: string;
  defaultValue?: string;
};
export default function TabsSorter({
  className,
  tabClassName,
  defaultValue = "latest",
}: TabsSorterProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onChange={(event) => console.log("Change", event)}
      className={cn(className)}
    >
      <TabsList className="space-x-3">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className={cn(tabClassName)}
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
