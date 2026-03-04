import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiFiTransfer } from '@/lib/lifi-types';

interface ScanState {
  // Persisted to localStorage (per CONTEXT.md - remember last wallet)
  lastWallet: string | null;

  // Session state (not persisted)
  currentWallet: string | null;
  isScanning: boolean;
  isCancelled: boolean;
  transactionCount: number;  // Running count during load (for progress display)
  transfers: LiFiTransfer[]; // Final result (empty until complete)
  error: string | null;      // Error message if failed

  // Actions
  setLastWallet: (wallet: string) => void;
  startScan: (wallet: string) => void;
  updateProgress: (count: number) => void;
  completeScan: (transfers: LiFiTransfer[]) => void;
  failScan: (error: string) => void;
  cancelScan: () => void;
  reset: () => void;
  clearLastWallet: () => void;

  // Deprecated: kept for backward compatibility with old useScanWallet hook
  // Will be removed when useLiFiTransfers replaces useScanWallet in Plan 02
  /** @deprecated Use updateProgress instead */
  updateChainResult: (chainName: string, result: unknown) => void;
  /** @deprecated No longer needed with LiFi API */
  resumeScan: () => void;
}

export const useScanStore = create<ScanState>()(
  persist(
    (set) => ({
      // Initial state
      lastWallet: null,
      currentWallet: null,
      isScanning: false,
      isCancelled: false,
      transactionCount: 0,
      transfers: [],
      error: null,

      // Actions
      setLastWallet: (wallet) => set({ lastWallet: wallet }),

      startScan: (wallet) => set({
        currentWallet: wallet,
        isScanning: true,
        isCancelled: false,
        transactionCount: 0,
        transfers: [],
        error: null,
        lastWallet: wallet,  // Also persist as last wallet
      }),

      updateProgress: (count) => set({
        transactionCount: count,
      }),

      completeScan: (transfers) => set({
        transfers,
        isScanning: false,
      }),

      failScan: (error) => set({
        error,
        isScanning: false,
      }),

      cancelScan: () => set({
        isScanning: false,
        isCancelled: true,
      }),

      reset: () => set({
        currentWallet: null,
        isScanning: false,
        isCancelled: false,
        transactionCount: 0,
        transfers: [],
        error: null,
      }),

      clearLastWallet: () => set({ lastWallet: null }),

      // Deprecated: kept for backward compatibility with old useScanWallet hook
      // These will be removed when useLiFiTransfers replaces useScanWallet in Plan 02
      updateChainResult: () => {},
      resumeScan: () => set({ isScanning: true, isCancelled: false }),
    }),
    {
      name: 'jumper-scan-store',
      // Only persist lastWallet to localStorage
      partialize: (state) => ({ lastWallet: state.lastWallet }),
      // Custom storage to handle serialization
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

// Selector helpers
export const selectTransactionCount = (state: ScanState) => state.transactionCount;
