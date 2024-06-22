"use client";
import { useRef, useEffect, useState } from "react";
import Template from "./template";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useAutosizeTextArea from "@/lib/hooks/useAutoSizeTextArea";
import useUpload from "@/lib/hooks/useUpload";
import Image from "next/image";
import Spinner from "../spinner";
import { HiX } from "react-icons/hi";
import { toast } from "../ui/use-toast";
import useAuthGuard from "./hooks/useAuthGuard";
import { createCalendar } from "@/actions/createEvent/calendar";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useNDK } from "@/app/providers/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { modal } from "@/app/providers/modal";

type CreateCalendarProps = {
  callback?: (calendarPubkey: string) => void;
};
export default function CreateCalendar(props: CreateCalendarProps) {
  useAuthGuard();
  const { ndk } = useNDK();
  const { currentUser } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const nameRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(nameRef.current, name);
  const [about, setAbout] = useState("");
  const {
    clear: pictureClear,
    UploadButton: UploadPictureButton,
    fileUrl: pictureFileUrl,
    status: pictureStatus,
    imagePreview: picturePreview,
  } = useUpload({
    folderName: "calendar",
  });
  const {
    clear: bannerClear,
    UploadButton: UploadBannerButton,
    fileUrl: bannerFileUrl,
    status: bannerStatus,
    imagePreview: bannerPreview,
  } = useUpload({
    folderName: "calendar",
  });

  async function handleSubmit() {
    if (!name || !about || !currentUser || !ndk) {
      setError("Missing data");
      return;
    }
    try {
      setIsSubmitting(true);
      const kind0 = await createCalendar({
        name,
        about,
        picture: pictureFileUrl,
        banner: bannerFileUrl,
        ownerPubkey: currentUser.pubkey,
      });
      const eventToPublish = new NDKEvent(ndk, kind0);
      await eventToPublish.publish();
      if (props.callback) {
        props.callback(kind0.pubkey);
      }
      toast({
        title: "Calendar Created!",
      });
      modal.dismiss();
    } catch (err) {
      console.log("err", err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Template className="md:max-w-[600px]" closeButton>
      <div className="">
        <Textarea
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Calendar Name"
          className={cn(
            "invisible-input text-foreground placeholder:text-muted-foreground/50 placeholder:hover:text-muted-foreground/80 !text-3xl font-bold outline-none",
            name === "" && "max-h-[60px]",
          )}
        />
        <div className="space-y-4">
          <div className="w-full">
            <Label className="text-muted-foreground">About</Label>
            <Textarea
              className="mt-1"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Some into about this calendar..."
            />
          </div>
          <div className="flex justify-end gap-3">
            {picturePreview ? (
              <div className="relative overflow-hidden rounded-xl">
                <div className="">
                  <Image
                    alt="Image"
                    height="288"
                    width="288"
                    src={picturePreview}
                    unoptimized
                    className={cn(
                      "bg-bckground h-full rounded-xl object-cover object-center max-sm:max-h-[100px]",
                      pictureStatus === "uploading" && "grayscale",
                      pictureStatus === "error" && "blur-xl",
                    )}
                  />
                </div>
                {pictureStatus === "uploading" && (
                  <button className="center bg-foreground text-background absolute left-1 top-1 rounded-full bg-opacity-70 p-1 hover:bg-opacity-100">
                    <Spinner />
                  </button>
                )}
                {pictureStatus === "success" && (
                  <button
                    onClick={pictureClear}
                    className="center bg-foreground absolute left-1 top-1 rounded-full bg-opacity-70 p-1 hover:bg-opacity-100"
                  >
                    <HiX
                      className="text-background block h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            ) : (
              <UploadPictureButton>
                <Button
                  className=""
                  variant={"outline"}
                  loading={pictureStatus === "uploading"}
                >
                  {pictureFileUrl ? "Uploaded!" : "Upload Image"}
                </Button>
              </UploadPictureButton>
            )}
            {bannerPreview ? (
              <div className="relative overflow-hidden rounded-xl">
                <div className="">
                  <Image
                    alt="Image"
                    height="288"
                    width="288"
                    src={bannerPreview}
                    unoptimized
                    className={cn(
                      "bg-bckground h-full rounded-xl object-cover object-center max-sm:max-h-[100px]",
                      bannerStatus === "uploading" && "grayscale",
                      bannerStatus === "error" && "blur-xl",
                    )}
                  />
                </div>
                {bannerStatus === "uploading" && (
                  <button className="center bg-foreground text-background absolute left-1 top-1 rounded-full bg-opacity-70 p-1 hover:bg-opacity-100">
                    <Spinner />
                  </button>
                )}
                {bannerStatus === "success" && (
                  <button
                    onClick={bannerClear}
                    className="center bg-foreground absolute left-1 top-1 rounded-full bg-opacity-70 p-1 hover:bg-opacity-100"
                  >
                    <HiX
                      className="text-background block h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            ) : (
              <UploadBannerButton>
                <Button
                  className=""
                  variant={"outline"}
                  loading={bannerStatus === "uploading"}
                >
                  {bannerFileUrl ? "Uploaded!" : "Upload Banner Image"}
                </Button>
              </UploadBannerButton>
            )}
          </div>
          {!!error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex">
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={
                pictureStatus === "uploading" || bannerStatus === "uploading"
              }
              className="w-full"
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </Template>
  );
}
