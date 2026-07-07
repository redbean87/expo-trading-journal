import { create } from 'zustand';

type PwaUpdateStore = {
  updateAvailable: boolean;
  isActivating: boolean;
  setUpdateAvailable: (available: boolean) => void;
  setActivating: (activating: boolean) => void;
};

export const usePwaUpdateStore = create<PwaUpdateStore>((set) => ({
  updateAvailable: false,
  isActivating: false,
  setUpdateAvailable: (available) => set({ updateAvailable: available }),
  setActivating: (activating) => set({ isActivating: activating }),
}));
