"use client";
import createGlobe from "cobe";
import React, { useEffect, useMemo, useRef } from "react";
import useDimensions from "@/lib/hooks/useElementSize";
import { clamp } from "ramda";
import { CalendarEvent } from "@repo/database";
import Geohash from "latlon-geohash";
type GlobeProps = {
  events: CalendarEvent[];
};
export default function Globe({ events }: GlobeProps) {
  const [dims, ref] = useDimensions();
  const canvasRef =
    useRef<
      React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement>,
        HTMLCanvasElement
      >
    >()!;
  const size = useMemo(() => clamp(300, 600, dims.width), [dims]);
  const markers = useMemo(
    () =>
      events
        .filter((g) => {
          if (!g.geohash) return false;
          try {
            Geohash.decode(g.geohash);
            return true;
          } catch (err) {
            return false;
          }
        })
        .map((e) => {
          const { lat, lon } = Geohash.decode(e.geohash!);
          return { location: [lat, lon], size: 0.03 + Math.random() * 0.07 };
        }),
    [events],
  );

  useEffect(() => {
    let phi = 0;
    // @ts-ignore
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      //   width: "100%",
      //   height: "100%",
      phi: 0,
      theta: 0,
      dark: -2,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: markers,
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, [size]);

  return (
    <div ref={ref} className="center flex-1 flex-col">
      <canvas
        // @ts-ignore
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: 1,
        }}
        className="mx-auto"
      />
      <div className="text-muted-foreground max-w-sm text-xs sm:max-w-none">
        <p className="text-center">
          These are all real events going on over the next month across the
          world. Powered by Nostr.
        </p>
      </div>
    </div>
  );
}
