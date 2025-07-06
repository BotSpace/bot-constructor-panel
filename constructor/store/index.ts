import { create } from 'zustand';
import { FlowStoreState } from './types';
import { createFlowSlice } from './flowSlice';
import { createClipboardSlice } from './clipboardSlice';
import { createActions } from './actions';

export const useFlowStore = create<FlowStoreState>()((...a) => ({
  // UI holatlari uchun boshlang'ich qiymatlar
  isDirty: false,
  isLoading: false,
  setDirty: (isDirty) => a[0]({ isDirty }),

  // Barcha slice'larni birlashtiramiz
  ...createFlowSlice(...a),
  ...createClipboardSlice(...a),
  ...createActions(...a),
}));
