"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function RegistrationButton() {
  const [isLoading, setIsLoading] = useState(false);
  async function handleRegister() {}
  return (
    <Button
      loading={isLoading}
      onClick={handleRegister}
      className="w-full font-semibold"
    >
      Register
    </Button>
  );
}
