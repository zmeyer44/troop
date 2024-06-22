"use client";
import { useEffect } from "react";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { modal } from "@/app/providers/modal";
import AuthModal from "../auth";
import currentUserStore from "@/lib/stores/currentUser";

export default function useAuthGuard() {
  const { currentUser } = useCurrentUser();
  useEffect(() => {
    if (!currentUser) {
      modal.show(<AuthModal />, {
        id: "auth",
      });
    }
  }, [currentUserStore]);
}
