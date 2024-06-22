import { Toaster } from "@/components/ui/toaster";
import { NDKProvider } from "./ndk";
import { RELAYS } from "@/constants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "./audioProvider";
import TRPCProvider from "./trpc/Provider";
import { SessionProvider } from "next-auth/react";
import { Modstr } from "./modal";
import { HttpAuthProvider } from "./httpAuth";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionProvider>
        <TRPCProvider>
          <TooltipProvider>
            <AudioProvider>
              <NDKProvider relayUrls={RELAYS}>
                <Modstr />
                <HttpAuthProvider />
                <div vaul-drawer-wrapper="" className="min-h-screen">
                  {children}
                </div>
              </NDKProvider>
            </AudioProvider>
          </TooltipProvider>
        </TRPCProvider>
      </SessionProvider>
      <Toaster />
    </>
  );
}
