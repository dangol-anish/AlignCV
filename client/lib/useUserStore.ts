import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/types/user";

interface UserState {
  user: IUser | null; // user must include token
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-auth",
    }
  )
);

export {};
