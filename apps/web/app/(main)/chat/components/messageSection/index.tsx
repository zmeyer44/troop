"use client";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import TextInput from "./textInput";
export default function MessageSection() {
  return (
    <div className="bg-muted/50 @lg/main:col-span-2 relative flex h-full min-h-[50vh] flex-col rounded-xl  p-4">
      <Badge variant="outline" className="absolute right-3 top-3">
        Output
      </Badge>
      <div className="flex-1" />
      <TextInput />
    </div>
  );
}
