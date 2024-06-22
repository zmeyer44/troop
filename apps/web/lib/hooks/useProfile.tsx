"use client";
import { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import { NOSTR_BECH32_REGEXP } from "@/lib/utils/nostr";
import { User } from "@repo/database";
import { getUser } from "@/actions/get/user";
import { PUBKEY } from "@/constants";
export default function useProfile(key: string) {
  //   const { ndk, getProfile } = useNDK();
  let pubkey = key ?? PUBKEY;
  if (NOSTR_BECH32_REGEXP.test(key)) {
    pubkey = nip19.decode(key).data.toString();
  }
  const npub = nip19.npubEncode(pubkey);
  const [user, setUser] = useState<User | undefined>();
  async function getProfile(pubkey: string) {
    const response = await getUser(pubkey);
    setUser(response);
  }
  useEffect(() => {
    // if (!ndk) return;
    void getProfile(pubkey);
    // return () => {
    //   // getUser(key);
    //   //   if (ndk) {
    //   //     void ndk.getUser({ hexpubkey: key }).fetchProfile();
    //   //   }
    // };
  }, [pubkey]);

  return { profile: user, pubkey, npub };
}
