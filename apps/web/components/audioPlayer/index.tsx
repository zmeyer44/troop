"use client";
import {
  IoPlayForward,
  IoPlayBack,
  IoPlay,
  IoVolumeHigh,
  IoClose,
  IoMic,
} from "react-icons/io5";

export default function AudioPlayer() {
  return (
    <div className="bg-secondary text-secondary-foreground group w-full rounded-sm px-3">
      <div className="max-h-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:max-h-[300px]">
        <div className="flex h-8 items-center overflow-hidden">
          <h2 className="truncate text-sm font-medium">
            Song title This is eiwgnawn inwego ineg in
          </h2>
          <div className="center ml-auto">
            <IoClose className="size-4" />
          </div>
        </div>
      </div>
      <div className="flex h-8 items-center justify-between">
        <IoMic className="size-4" />
        <div className="center w-1/2 justify-between">
          <IoPlayBack className="text-secondary-foreground/40 size-4" />
          <IoPlay className="size-4" />
          <IoPlayForward className="text-secondary-foreground/40 size-4" />
        </div>
        <IoVolumeHigh className="size-4" />
      </div>
    </div>
  );
}
