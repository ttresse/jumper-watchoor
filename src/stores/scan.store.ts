import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChainResult } from '@/lib/types';

interface ScanState {
  // Persisted to localStorage (per CONTEXT.md - remember last wallet)
  lastWallet: string | null;

  // Session state (not persisted)
  currentWallet: string | null;
  isScanning: boolean;
  isCancelled: boolean;
  chainResults: Map<string, ChainResult>;  // chainName -> result

  // Actions
  setLastWallet: (wallet: string) => void;
  startScan: (wallet: string) => void;
  updateChainResult: (chainName: string, result: ChainResult) => void;
  cancelScan: () => void;
  resumeScan: () => void;
  reset: () => void;
  clearLastWallet: () => void;
}

export const useScanStore = create<ScanState>()(
  persist(
    (set) => ({
      // Initial state
      lastWallet: null,
      currentWallet: null,
      isScanning: false,
      isCancelled: false,
      chainResults: new Map(),

      // Actions
      setLastWallet: (wallet) => set({ lastWallet: wallet }),

      startScan: (wallet) => set({
        currentWallet: wallet,
        isScanning: true,
        isCancelled: false,
        chainResults: new Map(),
        lastWallet: wallet,  // Also persist as last wallet
      }),

      updateChainResult: (chainName, result) => set((state) => {
        const newResults = new Map(state.chainResults);
        newResults.set(chainName, result);
        return { chainResults: newResults };
      }),

      cancelScan: () => set({
        isScanning: false,
        isCancelled: true
      }),

      resumeScan: () => set({
        isScanning: true,
        isCancelled: false
      }),

      reset: () => set({
        currentWallet: null,
        isScanning: false,
        isCancelled: false,
        chainResults: new Map(),
      }),

      clearLastWallet: () => set({ lastWallet: null }),
    }),
    {
      name: 'jumper-scan-store',
      // Only persist lastWallet to localStorage
      partialize: (state) => ({ lastWallet: state.lastWallet }),
      // Custom storage to handle Map serialization if needed
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Selector helpers for common queries
export const selectCompletedChains = (state: ScanState) =>
  Array.from(state.chainResults.values()).filter(r => r.status !== 'pending');

export const selectFailedChains = (state: ScanState) =>
  Array.from(state.chainResults.values()).filter(r => r.status === 'error');

export const selectSuccessfulChains = (state: ScanState) =>
  Array.from(state.chainResults.values()).filter(r => r.status === 'success');

export const selectTotalTransactions = (state: ScanState) =>
  Array.from(state.chainResults.values())
    .filter(r => r.status === 'success')
    .reduce((sum, r) => sum + r.transactionCount, 0);
