"use client";
import { useLoadScript, GoogleMap } from "@react-google-maps/api";
import { useMemo } from "react";
import Geohash from "latlon-geohash";

type LocationPreviewProps = {
  geohash: string;
};
export default function LocationBoxRaw({ geohash }: LocationPreviewProps) {
  const { lat, lon } = Geohash.decode(geohash);
  const libraries = useMemo(() => ["places"], []);
  const mapCenter = useMemo(() => ({ lat, lng: lon }), []);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: false,
    }),
    [],
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries: libraries as any,
  });

  if (!isLoaded) {
    return <div className="bg-muted h-full w-full"></div>;
  }
  return (
    <GoogleMap
      options={mapOptions}
      zoom={14}
      center={mapCenter}
      mapTypeId={google.maps.MapTypeId.ROADMAP}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      onLoad={() => console.log("Map Component Loaded...")}
    />
  );
}
