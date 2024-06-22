export const constructEventImage = (
  { title, image }: { title: string; image?: string | null },
  encodeUri = true,
): string => {
  const url = [
    `?type=event`,
    `&title=${encodeURIComponent(title)}`,
    image && `&image=${encodeURIComponent(image)}`,
  ].join("");
  return url;
  // return encodeUri ? encodeURIComponent(url) : url;
};
