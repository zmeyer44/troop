import { prisma } from "@repo/database";
import Link from "next/link";
import PageTitle from "@/components/headings/pageTitle";

export default async function Page() {
  const places = await prisma.place.findMany();
  return (
    <div className="flex-1 overflow-x-hidden">
      <PageTitle
        title={"Locations"}
        subtitle="See if you can find some local meetups"
      />
      <div className="md-feed-cols gap-3 p-3">
        {places.map((v) => (
          <Link key={v.id} href={`/locations/${v.slug}`}>
            <CityCard
              image={v.image}
              title={v.name}
              description={v.description}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import Image from "next/image";

type CityCardProps = {
  image: string;
  title: string;
  description: string;
};
function CityCard({ image, title, description }: CityCardProps) {
  return (
    <div className="group relative flex h-full flex-col rounded-lg">
      {/* Thumbnail */}
      <div className="">
        <div className="relative w-full">
          <div className="relative overflow-hidden rounded-md">
            <AspectRatio ratio={20 / 9} className="bg-muted">
              {!!image && (
                <Image
                  src={image}
                  alt={title}
                  width={450}
                  height={250}
                  unoptimized
                  className={cn(
                    "h-full w-full object-cover transition-all group-hover:scale-105",
                    "aspect-video",
                  )}
                />
              )}
            </AspectRatio>
          </div>
        </div>
      </div>
      {/* Details */}
      <div className="mt-2 flex flex-auto">
        <div className="overflow-x-hidden">
          <h2 className="text-foreground mb-1 line-clamp-2 text-[.95rem] font-semibold leading-tight">
            {title}
          </h2>
          <div className="flex flex-col">
            <div className="font-medium">
              <p className="text-muted-foreground text-[.8rem]">
                {description}
              </p>
            </div>
            <div className="text-muted-foreground flex items-center gap-x-1 text-[.8rem] font-medium"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
