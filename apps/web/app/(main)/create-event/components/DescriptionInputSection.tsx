"use client";
import { useState } from "react";
import { LuPenSquare } from "react-icons/lu";
import ButtonContainer from "./ButtonContainer";
import Editor from "@/components/markdown/editor";
import { cn } from "@/lib/utils";
type DescriptionInputSection = {
  content?: string;
  onChange: (text: string) => void;
};
export default function DescriptionInputSection({
  content,
  onChange,
}: DescriptionInputSection) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="bg-muted overflow-hidden rounded-lg">
      <div
        className={cn(
          "overflow-hidden transition-all",
          editing ? "max-h-[700px] min-h-[50px]" : "max-h-0",
        )}
      >
        <Editor setContent={(newData) => onChange(newData)} content={content} />
      </div>
      <ButtonContainer
        onClick={() => setEditing((prev) => !prev)}
        className="flex w-full items-center gap-x-2 rounded-t-none p-3"
      >
        <div className="shrink-0">
          <LuPenSquare className="text-muted-foreground/40 size-5" />
        </div>
        <div className="">
          <p className="text-muted-foreground test-base font-medium">
            {`${editing ? "Hide" : "Add"} Event Description`}
          </p>
        </div>
      </ButtonContainer>
    </div>
  );
}
