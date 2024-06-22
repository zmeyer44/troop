"use server";
import { z } from "zod";
import { createZodFetcher } from "zod-fetch";

const fetchWithZod = createZodFetcher();

const CoinRankingResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    price: z.string(),
    timestamp: z.number(),
  }),
});

export async function getBitcoinPrice() {
  const apiResponse = await fetchWithZod(
    CoinRankingResponseSchema,
    `https://api.coinranking.com/v2/coin/${"Qwsogvtv82FCd"}/price`,
    {
      method: "GET",
      headers: {
        "x-access-token": process.env.COIN_RANKING_API_KEY as string,
      },
      next: {
        revalidate: 7200 * 5,
      },
    },
  ).then((res) => res.data);
  if (!apiResponse) {
    return;
  }
  return parseInt(apiResponse.price);
}
