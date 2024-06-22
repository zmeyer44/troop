"use client";
import { useEffect, useMemo, useState } from "react";
import { LuMapPin } from "react-icons/lu";
import ButtonContainer from "./ButtonContainer";
import { useLoadScript } from "@react-google-maps/api";
import Geohash from "latlon-geohash";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HiOutlineBuildingStorefront,
  HiOutlineMapPin,
  HiOutlineHomeModern,
  HiOutlineFilm,
  HiOutlineShoppingBag,
  HiOutlineBuildingLibrary,
} from "react-icons/hi2";
import { RxMagnifyingGlass } from "react-icons/rx";
import { LiaGlassMartiniSolid } from "react-icons/lia";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Spinner from "@/components/spinner";

type LocationInputSection = {
  onSelect: (location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    geohash: string;
  }) => void;
  location?: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    geohash: string;
  };
};
export default function LocationInputSection(props: LocationInputSection) {
  // const libraries = useMemo(() => ["places"] as const, []);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries: ["places"],
  });

  if (loadError) {
    return (
      <ButtonContainer className="flex w-full items-center gap-x-2 p-3">
        <div className="shrink-0">
          <LuMapPin className="text-muted-foreground/40 size-5" />
        </div>
        <div className="">
          <p className="text-muted-foreground test-base font-medium">
            {loadError.message}
          </p>
        </div>
      </ButtonContainer>
    );
  } else if (!isLoaded) {
    return (
      <ButtonContainer className="flex w-full items-center gap-x-2 p-3">
        <div className="shrink-0">
          <LuMapPin className="text-muted-foreground/40 size-5" />
        </div>
        <div className="">
          <p className="text-muted-foreground test-base font-medium">
            Loading locations
          </p>
        </div>
      </ButtonContainer>
    );
  } else {
    return <LocationInput {...props} />;
  }
}

function LocationInput({ onSelect, location }: LocationInputSection) {
  const [open, setOpen] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data, loading }, // results from Google Places API for the given search term
    setValue, // use this method to link input value with the autocomplete hook
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
    cache: 86400,
  });
  async function handleSelect(placeId: string, name: string) {
    const result = await getGeocode({
      placeId,
    });
    if (!result[0]) return;
    const coordinates = getLatLng(result[0]);
    const geohash = Geohash.encode(coordinates.lat, coordinates.lng, 8);
    setOpen(false);
    return onSelect({
      name,
      coordinates,
      address: result[0].formatted_address,
      geohash,
    });
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex w-full text-left">
          <ButtonContainer className="flex w-full items-center gap-x-2 p-3">
            <div className="shrink-0">
              <LuMapPin className="text-muted-foreground/40 size-5" />
            </div>
            <div className="">
              <p className="text-muted-foreground test-base font-medium">
                {location ? (
                  <div className="flex max-w-full items-baseline gap-x-2">
                    <p className="line-clamp-1">
                      {location.name}
                      <span className="text-muted-foreground ml-1 text-xs">
                        {location.address}
                      </span>
                    </p>
                  </div>
                ) : (
                  "Add Event Location"
                )}
              </p>
            </div>
          </ButtonContainer>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align={"start"}>
        <div className="rounded-lg border shadow-md">
          <div className="relative flex">
            <Input
              className="border-0 pl-[30px] shadow-none outline-none focus-visible:ring-0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search places..."
              disabled={!ready}
            />
            <div className="center absolute inset-y-0 left-[8px]">
              <RxMagnifyingGlass className="h-4 w-4" />
            </div>
          </div>
          <ul className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden")}>
            {data.map((place) => {
              const {
                place_id,
                structured_formatting: { main_text, secondary_text },
                types,
              } = place;
              return (
                <li
                  key={place_id}
                  onClick={() => handleSelect(place_id, main_text)}
                  className={cn(
                    "aria-selected:text-accent-foreground hover:bg-muted relative flex cursor-pointer select-none  items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <RenderIcon types={types} className="mr-2 h-4 w-4" />
                  <div className="flex-1 space-y-0.5">
                    <p className="line-clamp-1">{main_text}</p>
                    <span className=" text-muted-foreground line-clamp-1 text-[10px] leading-none">
                      {secondary_text}
                    </span>
                  </div>
                </li>
              );
            })}
            {data.length === 0 && status === "ZERO_RESULTS" && (
              <div className="p-3 text-center">
                <p>No results found</p>
              </div>
            )}
            {loading && (
              <div className="center text-primary p-3">
                <Spinner />
              </div>
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RenderIcon({
  types,
  className,
}: {
  types: string[];
  className?: string;
}) {
  if (types.includes("restaurant")) {
    return <HiOutlineBuildingStorefront className={className} />;
  } else if (types.includes("art_gallery")) {
    return <HiOutlineHomeModern className={className} />;
  } else if (types.includes("bar")) {
    return <LiaGlassMartiniSolid className={className} />;
  } else if (types.includes("city_hall")) {
    return <HiOutlineBuildingLibrary className={className} />;
  } else if (types.includes("store")) {
    return <HiOutlineShoppingBag className={className} />;
  } else if (types.includes("movie_theater")) {
    return <HiOutlineFilm className={className} />;
  }
  return <HiOutlineMapPin className={className} />;
}
