import { create } from 'zustand';

type PwaUpdateStore = {
  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;
};

export const usePwaUpdateStore = create<PwaUpdateStore>((set) => ({
  updateAvailable: false,
  setUpdateAvailable: (available) => set({ updateAvailable: available }),
}));
