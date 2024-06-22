"use client";
import { useEffect, memo } from "react";
import useUpload from "@/lib/hooks/useUpload";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";

type ImageUploadSectionProps = {
  url?: string;
  onChange: (image: string) => void;
};

export default memo(function ImageUploadSection({
  url,
  onChange,
}: ImageUploadSectionProps) {
  const { UploadButton, fileUrl, status } = useUpload({
    folderName: "events",
  });
  useEffect(() => {
    if (status === "success" && fileUrl) {
      onChange(fileUrl);
    }
  }, [status]);
  console.log("Image render");

  if (url) {
    return (
      <div className="center relative overflow-hidden rounded-lg bg-gradient-to-t pb-[100%]">
        <div className="bg-muted absolute inset-0">
          <Image
            src={url}
            alt={"banner image"}
            fill
            unoptimized
            objectFit="cover"
            className="object-cover"
          />
        </div>
        <UploadButton>
          <Button
            loading={status === "uploading"}
            className="absolute right-1 top-1 font-semibold"
            variant={"secondary"}
            size={"sm"}
          >
            Change
          </Button>
        </UploadButton>
      </div>
    );
  }

  return (
    <div className="center relative overflow-hidden rounded-lg bg-gradient-to-t pb-[100%]">
      <div className="bg-frosted absolute inset-0">
        <UploadButton>
          <Image
            src={"https://flockstr.s3.amazonaws.com/event/upload-image.svg"}
            alt={"banner image"}
            fill
            unoptimized
            objectFit="cover"
            className="object-cover"
          />
        </UploadButton>
      </div>
      {status === "uploading" && (
        <div className="center absolute inset-0">
          <Spinner />
        </div>
      )}
    </div>
  );
});
