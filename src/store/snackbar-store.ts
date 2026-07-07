import { create } from 'zustand';

type SnackbarAction = {
  label: string;
  onPress: () => void;
};

type SnackbarStore = {
  visible: boolean;
  message: string;
  action?: SnackbarAction;
  duration: number;
  show: (
    message: string,
    options?: { action?: SnackbarAction; duration?: number }
  ) => void;
  hide: () => void;
};

export const useSnackbarStore = create<SnackbarStore>((set) => ({
  visible: false,
  message: '',
  action: undefined,
  duration: 4000,
  show: (message, options) =>
    set({
      visible: true,
      message,
      action: options?.action,
      duration: options?.duration ?? 4000,
    }),
  hide: () => set({ visible: false, message: '', action: undefined }),
}));
