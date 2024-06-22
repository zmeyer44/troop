import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import gfm from "remark-gfm";

type BodyMarkdownProps = {
  markdown: string;
  className?: string;
};
export default function PlainText({ markdown, className }: BodyMarkdownProps) {
  return (
    <Markdown
      remarkPlugins={[gfm]}
      className={cn(
        "prose prose-sm w-full max-w-none overflow-y-auto text-left",
        className,
      )}
    >
      {markdown}
    </Markdown>
  );
}
