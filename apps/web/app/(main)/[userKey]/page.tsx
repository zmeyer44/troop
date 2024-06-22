import BannerSection from "./components/banner";
import { nip19 } from "nostr-tools";
import { getUser } from "@/actions/get/user";

type ProfilePageProps = {
  params: {
    userKey: string;
  };
};

const user = {
  picture: null,
  pubkey: "9ca0bd7450742d6a20319c0e3d4c679c9e046a9dc70e8ef55c2905e24052340b",
  about: null,
  name: "Demo User",
  nip05: "demo@user.com",
  banner: null,
  lud16: null,
  lud06: null,
  event_id: null,
};

const isPubkey = /^[a-f0-9]{64}$/;
export default async function ProfilePage({
  params: { userKey },
}: ProfilePageProps) {
  let pubkey = userKey;
  if (!isPubkey.test(pubkey)) {
    if (nip19.BECH32_REGEX.test(pubkey)) {
      const { data, type } = nip19.decode(pubkey);
      if (type === "npub") {
        pubkey = data;
      } else if (type === "nprofile") {
        pubkey = data.pubkey;
      }
    }
  }
  const user = await getUser(pubkey);

  if (!user) {
    throw new Error("User not found");
  }
  return (
    <div className="mx-auto w-full max-w-7xl p-3 md:p-4">
      <BannerSection profile={user} />
      <div className="mt-8 w-full"></div>
    </div>
  );
}
