"use client";
import { useEffect, useState } from "react";
import { useNDK } from "../ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { useSession, signIn } from "next-auth/react";
import { authEvent } from "@/lib/nostr/create/authEvent";

export function HttpAuthProvider() {
  const { ndk } = useNDK();
  const { data: session, status: httpAuthStatus } = useSession();
  const [promptShown, setPromptShown] = useState(false);

  useEffect(() => {
    console.log("running http effect", session);
    if (session) return;
    if (ndk?.activeUser?.pubkey && httpAuthStatus === "unauthenticated") {
      console.log("Active user", ndk?.activeUser?.pubkey);
      void attemptHttpLogin_();
      setPromptShown(true);
    }
  }, [ndk, httpAuthStatus, session]);

  async function attemptHttpLogin_() {
    console.log("At attemptHttpLogin_");
    if (!ndk || !ndk?.activeUser?.pubkey) return;
    return await attemptHttpLogin(ndk);
  }
  return null;
}

export async function attemptHttpLogin(ndk: NDK) {
  console.log("Attempting login");
  if (!ndk) return;
  try {
    const event = await authEvent(ndk);
    if (!event) return;
    const authRes = await signIn("nip-98", {
      event: JSON.stringify(event),
      redirect: false,
    });
    console.log("authRes", authRes);
    return authRes;
  } catch (err) {
    console.log("Error http login");
  }
}
