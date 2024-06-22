"use client";
import useProfile from "@/lib/hooks/useProfile";
import ProfileAvatar from ".";

type ControlledAvatarProps = {
  pubkey: string;
  className?: string;
};
export default function ControlledAvatar({
  pubkey,
  className,
}: ControlledAvatarProps) {
  const data = useProfile(pubkey);
  return <ProfileAvatar {...data} className={className} />;
}
