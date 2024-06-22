import LocationBoxRaw from "@/components/maps/rawMap";
import { HiOutlineMapPin } from "react-icons/hi2";

type LocationSectionProps = {
  geohash: string;
  address: string;
};
export default function LocationSection({
  geohash,
  address,
}: LocationSectionProps) {
  return (
    <div className="@container">
      <div className="h-[150px] overflow-hidden rounded-lg">
        <LocationBoxRaw geohash={geohash} />
      </div>
      <div className="@lg:px-2 @lg:pt-1 flex items-center">
        <p className="text-muted-foreground pt-1.5 text-xs">{address}</p>
      </div>
    </div>
  );
}
