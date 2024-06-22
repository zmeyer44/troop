"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
// import useEvents from "@/lib/hooks/useEvents";
import { z } from "zod";
import { useNDK } from "@/app/providers/ndk";
import { nip19, getPublicKey } from "nostr-tools";
import { NDKPrivateKeySigner, NDKSigner, NDKUser } from "@nostr-dev-kit/ndk";
import { webln } from "@getalby/sdk";
import { api } from "../trpc/api";
import { attemptHttpLogin } from "@/app/providers/httpAuth";
import { upsertUser } from "@/actions/user/upsert";

const UserSchema = z.object({
  npub: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  display_name: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  about: z.string().optional(),
  website: z.string().optional(),
  lud06: z.string().optional(),
  lud16: z.string().optional(),
  nip05: z.string().optional(),
});

const loadNWCUrl = "";
const nwc = new webln.NWC({ nostrWalletConnectUrl: loadNWCUrl });

export default function useCurrentUser() {
  const { data: sessionData } = useSession();
  const { loginWithNip07, ndk, loginWithNip46 } = useNDK();

  const trpcUtils = api.useUtils();

  const { data: dbUser } = api.user.getCurrentUser.useQuery(undefined, {
    enabled: !!sessionData,
  });
  // useEffect(() => {
  //   if (ndk && sessionData?.user && !dbUser) {
  //     ndk.activeUser = new NDKUser({
  //       hexpubkey: sessionData.user.id,
  //     });
  //     attemptHttpLogin(ndk);
  //   }
  // }, [ndk, dbUser]);

  async function setSigner() {
    const signer = localStorage.getItem("signer");
    console.log("Set signer called", signer);
    if (signer === "nip-07") {
      await loginWithNip07();
      return;
    } else if (signer === "nip-46") {
      const nip46target = localStorage.getItem("nip46target");
      const nip46sk = localStorage.getItem("nip46sk");
      if (nip46target) {
        await loginWithNip46(nip46target, nip46sk ?? undefined);
        return;
      }
    }
    // logout();
  }
  useEffect(() => {
    if (ndk && !ndk.signer && sessionData?.user) {
      setSigner();
    }
  }, [ndk, sessionData]);

  async function attemptLogin() {
    console.log("attemptLogin()");
    try {
      const shouldReconnect = localStorage.getItem("shouldReconnect");
      const localnip46sk = localStorage.getItem("nip46sk");
      if (!shouldReconnect && !localnip46sk) return console.log("!!");
      if (ndk?.signer) return console.log("ndk signer");
      const nip46targetPubkey = localStorage.getItem("nip46target");
      if (localnip46sk && nip46targetPubkey) {
        const user = await loginWithNip46(nip46targetPubkey, localnip46sk);
        if (user) {
          await loginWithPubkey(nip46targetPubkey);
          console.log("return nip46targetPubkey");
          return;
        }
      }
      if (typeof window.nostr !== "undefined") {
        const user = await loginWithNip07();
        if (!user) {
          throw new Error("NO auth");
        }
        const pubkey = nip19.decode(user.npub).data.toString();
        await loginWithPubkey(pubkey);
      }
      if (typeof window.webln !== "undefined") {
        await window.webln.enable();
      }
      console.log("connected ");
    } catch (err) {
      console.log("Error at attemptLogin", err);
    }
  }

  function logout() {
    console.log("Logout");
    localStorage.removeItem("shouldReconnect");
    localStorage.removeItem("nip46sk");

    signOut();
    trpcUtils.user.getCurrentUser.invalidate();
    // window.location.reload();
  }
  function handleUpdateUser(userInfo: string) {
    const userObject = UserSchema.safeParse(JSON.parse(userInfo));
    if (!userObject.success) return;
    const parsedData = UserSchema.safeParse({
      ...dbUser,
      ...userObject,
    });
    if (parsedData.success && dbUser) {
      upsertUser({
        about: parsedData.data.about,
        nip05: parsedData.data.nip05,
        lud16: parsedData.data.lud16,
        lud06: parsedData.data.lud06,
        banner: parsedData.data.banner,
        picture: parsedData.data.image,
        pubkey: dbUser.pubkey,
        name: parsedData.data.name ?? parsedData.data.display_name ?? "Unnamed",
      });
    }
  }

  async function loginWithPubkey(pubkey: string) {
    console.log("loginWithPubkey");
    if (!ndk) return;
    const user = ndk.getUser({ hexpubkey: pubkey });
    console.log("user", user);
    await user.fetchProfile();
    await upsertUser({
      ...user?.profile,
      picture: user?.profile?.image,
      pubkey: pubkey,
      name:
        user?.profile?.name ??
        (user?.profile?.display_name as string) ??
        "Unnamed",
    });
    ndk.activeUser = user;
    await attemptHttpLogin(ndk);

    // setCurrentUser(user);
    if (typeof window.webln !== "undefined") {
      await window.webln.enable();
    }
  }

  // useEffect(() => {
  //   if (!currentUser) return;
  //   console.log("fetching follows");
  //   handleFetchFollows();
  // }, [currentUser]);

  // async function handleFetchFollows() {
  //   if (!currentUser) return;
  //   // setFetchingFollows(true);
  //   const following = await currentUser.follows();
  //   // console.log("fetching follows", fetchingFollows);
  // }

  return {
    currentUser: dbUser,
    isLoading: false,
    logout,
    updateUser: handleUpdateUser,
    loginWithPubkey,
    attemptLogin,
  };
}
