"use client";
import { useState } from "react";
import { z } from "zod";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BsFillShieldLockFill } from "react-icons/bs";
import { client } from "@passwordless-id/webauthn";
import { getChallenge } from "@/actions/broker";

export default function Page() {
  async function handleSignIn() {
    const { challenge, credentialId } = await getChallenge();
    const authentication = await client.authenticate(
      [credentialId],
      challenge,
      {
        timeout: 60000,
        authenticatorType: "auto",
        userVerification: "required",
      },
    );
  }
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Grant access</CardTitle>
        <CardDescription>Be sure to save all keys safely</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center gap-x-3">
          <BsFillShieldLockFill className="size-10 shrink-0" />
          <div className="text-sm">
            <p>Trust-minimized Nsecbunker using FROST signature scheme</p>
            <span className="text-destructive text-xs leading-none">
              For testing purposes only!
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSignIn} className="w-full">
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
}
