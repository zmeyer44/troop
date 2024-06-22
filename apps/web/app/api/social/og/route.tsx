import { ImageResponse } from "next/og";
import type { SatoriOptions } from "satori";
import { z } from "zod";
import Event from "./Event";
import Default from "./Default";

const size = {
  width: 1200,
  height: 630,
};
export const runtime = "edge";
const calFont = fetch(
  new URL("../../../../fonts/cal.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const interFont = fetch(
  new URL("../../../../fonts/Inter-Regular.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const interFontMedium = fetch(
  new URL("../../../../fonts/Inter-Medium.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const genericSchema = z.object({
  imageType: z.literal("generic"),
  title: z.string(),
  description: z.string().nullish(),
});
const eventSchema = z.object({
  imageType: z.literal("event"),
  title: z.string(),
  description: z.string().nullish(),
  image: z.string().optional(),
});

async function handler(req: Request) {
  const { searchParams } = new URL(`${req.url}`);
  const imageType = searchParams.get("type");

  const [calFontData, interFontData, interFontMediumData] = await Promise.all([
    calFont,
    interFont,
    interFontMedium,
  ]);

  const ogConfig = {
    ...size,
    fonts: [
      { name: "inter", data: interFontData, weight: 400 },
      { name: "inter", data: interFontMediumData, weight: 500 },
      { name: "cal", data: calFontData, weight: 400 },
      { name: "cal", data: calFontData, weight: 600 },
    ] as SatoriOptions["fonts"],
  };

  switch (imageType) {
    case "event": {
      const { title, image, description } = eventSchema.parse({
        title: searchParams.get("title"),
        description: searchParams.get("description"),
        image: searchParams.get("image") ?? undefined,
        imageType,
      });

      return new ImageResponse(<Event title={title} image={image} />, ogConfig);
    }

    case "generic": {
      const { title, description } = genericSchema.parse({
        title: searchParams.get("title"),
        description: searchParams.get("description"),
        imageType,
      });

      return new ImageResponse(<Default title={title} />, ogConfig);
    }

    default:
      return new ImageResponse(
        <Default title={"Welcome to Troop"} />,
        ogConfig,
      );
  }

  //   return new ImageResponse(
  //     (
  //       <div
  //         style={{
  //           fontSize: 48,
  //           background: "white",
  //           width: "100%",
  //           height: "100%",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         {post.title}
  //       </div>
  //     ),
  //     ogConfig,
  //   );
}
export { handler as GET };
