export const NOSTR_BECH32_REGEXP =
  /^(npub|nprofile|note|nevent|naddr|nrelay)1[023456789acdefghjklmnpqrstuvwxyz]+/;
export const getTagValues = (name: string, tags: string[][]) => {
  const [itemTag] = tags.filter((tag: string[]) => tag[0] === name);
  const [, item] = itemTag || [, undefined];
  return item;
};

export const getTagAllValues = (name: string, tags: string[][]) => {
  const [itemTag] = tags.filter((tag: string[]) => tag[0] === name);
  const itemValues = itemTag || [, undefined];
  return itemValues.map((i, idx) => (idx ? i : undefined)).filter(Boolean);
};
export const getTagsValues = (name: string, tags: string[][]) => {
  const itemTags = tags.filter((tag: string[]) => tag[0] === name);
  return itemTags.map(([key, val]) => val) ?? [];
};
export const getTagsAllValues = (name: string, tags: string[][]) => {
  const itemTags = tags.filter((tag: string[]) => tag[0] === name);
  return itemTags.map(([key, ...vals]) => vals) ?? [];
};
