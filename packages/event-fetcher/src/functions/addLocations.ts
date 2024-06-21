import { prisma } from "@repo/database";

const newLocations = [
  {
    name: "New York City",
    slug: "nyc",
    description: "The city that never sleeps loves Bitcoin.",
    image: "https://flockstr.s3.amazonaws.com/locations/nyc.jpg",
  },
  {
    name: "Austin",
    slug: "austin",
    description:
      "A vibrant, music-loving city at the heart of Texas' tech boom.",
    image: "https://flockstr.s3.amazonaws.com/locations/austin.jpg",
  },
  {
    name: "Chicago",
    slug: "chicago",
    description: "Known for its stunning architecture and deep-dish pizza.",
    image: "https://flockstr.s3.amazonaws.com/locations/chicago.jpg",
  },
  {
    name: "Prauge",
    slug: "prauge",
    description:
      "The City of a Hundred Spires, rich in history and stunning architecture.",
    image: "https://flockstr.s3.amazonaws.com/locations/prauge.jpeg",
  },
  {
    name: "Nashville",
    slug: "nashville",
    description: "The heart of country music and vibrant cultural life.",
    image: "https://flockstr.s3.amazonaws.com/locations/nashville.jpeg",
  },
  {
    name: "Madeira",
    slug: "madeira",
    description:
      "A Portuguese archipelago renowned for its lush landscapes and wine.",
    image: "https://flockstr.s3.amazonaws.com/locations/madeira.jpg",
  },
  {
    name: "Costa Rica",
    slug: "costa-rica",
    description:
      "A paradise of biodiversity, adventure, and endless coastlines.",
    image: "https://flockstr.s3.amazonaws.com/locations/costarica.jpeg",
  },
  {
    name: "San Francisco",
    slug: "sf",
    description:
      "Iconic for its Golden Gate Bridge, tech innovation, and steep rolling hills.",
    image: "https://flockstr.s3.amazonaws.com/locations/sanfrancisco.avif",
  },
];

export async function addLocations() {
  console.log("addLocations");
  await prisma.place.createMany({
    data: newLocations.map((l) => ({
      ...l,
    })),
  });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
