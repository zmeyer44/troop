import { HiOutlineMapPin } from "react-icons/hi2";

export default function PinIcon() {
  return (
    <div className="center bg-background text-muted-foreground h-10 w-10 shrink-0 overflow-hidden rounded-sm border">
      <div className="center w-full text-center">
        <div className="text-center text-[14px] font-medium">
          <HiOutlineMapPin className="size-5" />
        </div>
      </div>
    </div>
  );
}
