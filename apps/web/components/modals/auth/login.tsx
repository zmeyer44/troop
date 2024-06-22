"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerBody,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Steps } from ".";
import { useNDK } from "@/app/providers/ndk";
import { nip05, nip19 } from "nostr-tools";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { toast } from "@/components/ui/use-toast";

const loginFormSchema = z.object({
  username: z.string(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<LoginFormValues> = {};

type LoginFormProps = {
  setStep: React.Dispatch<React.SetStateAction<Steps>>;
};
export default function loginForm({ setStep }: LoginFormProps) {
  const [isLoadingExtension, setIsLoadingExtension] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithNip46, loginWithNip07 } = useNDK();
  const { loginWithPubkey } = useCurrentUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
    delayError: 2000,
  });
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      let npub = data.username;
      let targetPubkey;
      // Check if nip-05
      if (!npub.startsWith("npub")) {
        const pubkey = await nip05.queryProfile(npub.toLowerCase());
        if (!pubkey) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Unable to find profile",
          });
          return;
        }
        targetPubkey = pubkey.pubkey;
        npub = nip19.npubEncode(targetPubkey);
      }
      const { data: d } = nip19.decode(npub);

      const login = await loginWithNip46(d.toString());

      if (login) {
        // alert(`Logging in  ${login.remoteSigner.remotePubkey}`);
        await loginWithPubkey(d.toString());
        if (login.sk) {
          localStorage.setItem("signer", "nip-46");
          localStorage.setItem("nip46sk", login.sk);
          localStorage.setItem("nip46target", d.toString());
        }
        // localStorage.setItem("shouldReconnect", "true");
        toast({
          title: "Logged in!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Unable to login",
        });
      }
    } catch (err) {
      console.log("Error in login", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithExtension() {
    if (typeof window.nostr === "undefined") {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "No extension found",
      });
      return;
    }
    setIsLoadingExtension(true);
    try {
      const user = await loginWithNip07();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Unable to access extension",
        });
        throw new Error("No user found");
      }
      localStorage.setItem("signer", "nip-07");
      await loginWithPubkey(user.user.pubkey);
      localStorage.setItem("shouldReconnect", "true");
    } catch (err) {
      console.log("Error logging in with extension", err);
    } finally {
      setIsLoadingExtension(false);
    }
  }

  return (
    <div className="">
      <DrawerHeader>
        <DrawerTitle className="font-cal text-2xl">Login to troop</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 text-left"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nostr address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nostr address or npub..."
                      className="text-[16px] sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your nostr address of npub
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button loading={isLoading} type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <Button
            loading={isLoadingExtension}
            onClick={loginWithExtension}
            variant={"secondary"}
          >
            Login with extension
          </Button>
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button onClick={() => setStep("create-account")} variant="ghost">
          Don't have an account?
        </Button>
      </DrawerFooter>
    </div>
  );
}
