import { create } from "zustand";
import type { NDKUser } from "@nostr-dev-kit/ndk";

type Settings = {};

interface CurrentUserState {
  currentUser: NDKUser | null;
  settings: Settings;
  setCurrentUser: (user: NDKUser | null) => void;
  updateCurrentUser: (user: Partial<NDKUser>) => void;
}

const currentUserStore = create<CurrentUserState>()((set) => ({
  currentUser: null,
  settings: {},
  setCurrentUser: (user) => set((state) => ({ ...state, currentUser: user })),
  updateCurrentUser: (user) =>
    set((state) => ({
      ...state,
      currentUser: { ...state.currentUser, ...user } as NDKUser,
    })),
}));

export default currentUserStore;
