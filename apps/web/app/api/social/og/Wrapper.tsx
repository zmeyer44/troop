import { ReactNode } from "react";

export default function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div tw="flex w-full h-full">
      <img
        tw="flex absolute left-0 top-0 w-full h-[110%]"
        src={`https://o-0-o-image-storage.s3.amazonaws.com/social-bg-blue.jpg`}
        alt="background"
        width="1200"
        height="600"
      />
      <div tw="flex flex-col w-full h-full px-[80px] py-[70px] items-start justify-center">
        {children}
      </div>
    </div>
  );
}
