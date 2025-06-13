import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/types/user";

interface UserState {
  user: IUser | null; // user must include token
  authLoading: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      authLoading: true,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setAuthLoading: (loading) => set({ authLoading: loading }),
    }),
    {
      name: "user-auth",
    }
  )
);

export {};
