import { create } from 'zustand';

import { DuplicatePair } from '../hooks/use-duplicate-detection';

type DuplicateReviewStore = {
  pairs: DuplicatePair[];
  isReviewActive: boolean;
  setPairs: (pairs: DuplicatePair[]) => void;
  clearPairs: () => void;
  startReview: () => void;
  endReview: () => void;
  removePair: (existingId: string, importedId: string) => void;
};

export const useDuplicateReviewStore = create<DuplicateReviewStore>((set) => ({
  pairs: [],
  isReviewActive: false,

  setPairs: (pairs: DuplicatePair[]) => {
    set({ pairs });
  },

  clearPairs: () => {
    set({ pairs: [], isReviewActive: false });
  },

  startReview: () => {
    set({ isReviewActive: true });
  },

  endReview: () => {
    set({ isReviewActive: false });
  },

  removePair: (existingId: string, importedId: string) => {
    set((state) => ({
      pairs: state.pairs.filter(
        (p) =>
          !(
            (p.existing.id === existingId && p.imported.id === importedId) ||
            (p.existing.id === importedId && p.imported.id === existingId)
          )
      ),
    }));
  },
}));
