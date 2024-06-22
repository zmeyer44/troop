"use client";
import { getBitcoinPrice } from "@/lib/services/bitcoin/getBitcoinPrice";
import { useQuery } from "@tanstack/react-query";
import { formatMoney } from "@/lib/utils";

export default function useBitcoinPrice() {
  const { data: bitcoinPrice } = useQuery({
    queryFn: () => getBitcoinPrice(),
    queryKey: [`current-bitcoin-price`],
    staleTime: 180,
  });
  return {
    bitcoinPrice,
    formatAsMoney: (sats: number, currency?: string) => {
      if (bitcoinPrice) {
        return formatMoney((sats / 100_000_000) * bitcoinPrice, currency);
      }
      return null;
    },
  };
}
