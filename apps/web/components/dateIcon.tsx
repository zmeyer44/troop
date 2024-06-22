import { formatDate } from "@/lib/utils/dates";

type SmallCalendarIconProps = {
  date: Date;
};
export default function DateIcon({ date }: SmallCalendarIconProps) {
  return (
    <div className="center bg-background text-muted-foreground min-w-10 shrink-0 overflow-hidden rounded-sm border">
      <div className="w-full text-center">
        <div className="bg-muted p-[2px] text-[10px] font-semibold uppercase">
          {formatDate(date, "MMM")}
        </div>
        <div className="text-foreground pb-[2px] text-center text-[14px] font-semibold">
          {formatDate(date, "D")}
        </div>
      </div>
    </div>
  );
}
