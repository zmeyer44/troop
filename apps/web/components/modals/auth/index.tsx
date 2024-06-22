"use client";

import { useEffect, useState } from "react";

import { modal } from "@/app/providers/modal";
import useCurrentUser from "@/lib/hooks/useCurrentUser";

import LoginForm from "./login";
import CreateAccountForm from "./createAccount";

export type Steps = "create-account" | "login";

type AuthModalProps = {
  step?: Steps;
};

export default function AuthModal({
  step: startingStep = "login",
}: AuthModalProps) {
  const [step, setStep] = useState<Steps>(startingStep);

  const { currentUser } = useCurrentUser();
  useEffect(() => {
    if (currentUser) {
      modal.dismiss("auth");
    }
  }, [currentUser]);

  if (step === "create-account") {
    return <CreateAccountForm setStep={setStep} />;
  }
  return <LoginForm setStep={setStep} />;
}
