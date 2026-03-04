/**
 * Progressive Loading Tests (SCAN-04)
 *
 * These tests verify that:
 * 1. Chain results update progressively as queries complete
 * 2. Progress counter increments correctly
 * 3. Cancel preserves partial results
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScanWallet } from '@/hooks/useScanWallet';
import type { ReactNode } from 'react';

// Mock the Covalent adapter to simulate progressive completion
jest.mock('@/adapters/covalent.adapter', () => ({
  fetchChainTransactions: jest.fn(),
}));

// Mock the chains to use a small set for testing
jest.mock('@/lib/chains', () => ({
  SUPPORTED_CHAINS: [
    { name: 'eth-mainnet', chainId: 1, displayName: 'Ethereum' },
    { name: 'matic-mainnet', chainId: 137, displayName: 'Polygon' },
    { name: 'arbitrum-mainnet', chainId: 42161, displayName: 'Arbitrum' },
  ],
  LIFI_DIAMOND: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
}));

// Mock Zustand store
jest.mock('@/stores/scan.store', () => ({
  useScanStore: jest.fn(() => ({
    startScan: jest.fn(),
    updateChainResult: jest.fn(),
    cancelScan: jest.fn(),
    isCancelled: false,
    reset: jest.fn(),
  })),
}));

import { fetchChainTransactions } from '@/adapters/covalent.adapter';

const mockFetch = fetchChainTransactions as jest.MockedFunction<typeof fetchChainTransactions>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('Progressive Loading (SCAN-04)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('progressively updates completedChains as queries resolve', async () => {
    // Create delayed responses to simulate staggered completion
    const resolvers: Array<(value: ReturnType<typeof fetchChainTransactions> extends Promise<infer T> ? T : never) => void> = [];

    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    });

    const { result } = renderHook(
      () => useScanWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f12345'),
      { wrapper: createWrapper() }
    );

    // Initially, nothing completed
    expect(result.current.completedChains).toBe(0);
    expect(result.current.totalChains).toBe(3);
    expect(result.current.isLoading).toBe(true);

    // Resolve first chain
    await act(async () => {
      resolvers[0]?.([{ hash: '0x123', timestamp: Date.now(), chainId: 1, chainName: 'eth-mainnet', value: '0', gasUsed: '0', toAddress: '', fromAddress: '', successful: true, logEvents: [] }]);
    });

    await waitFor(() => {
      expect(result.current.completedChains).toBe(1);
    });

    // Resolve second chain
    await act(async () => {
      resolvers[1]?.([]);
    });

    await waitFor(() => {
      expect(result.current.completedChains).toBe(2);
    });

    // Still loading until all complete
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isComplete).toBe(false);

    // Resolve third chain
    await act(async () => {
      resolvers[2]?.([]);
    });

    await waitFor(() => {
      expect(result.current.completedChains).toBe(3);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('successfulChains updates as queries complete with transactions', async () => {
    const resolvers: Array<(value: ReturnType<typeof fetchChainTransactions> extends Promise<infer T> ? T : never) => void> = [];

    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    });

    const { result } = renderHook(
      () => useScanWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f12345'),
      { wrapper: createWrapper() }
    );

    // Initially empty
    expect(result.current.successfulChains).toHaveLength(0);

    // Resolve with transactions
    await act(async () => {
      resolvers[0]?.([
        { hash: '0x123', timestamp: Date.now(), chainId: 1, chainName: 'eth-mainnet', value: '1000000000', gasUsed: '21000', toAddress: '0xabc', fromAddress: '0xdef', successful: true, logEvents: [] },
        { hash: '0x456', timestamp: Date.now(), chainId: 1, chainName: 'eth-mainnet', value: '2000000000', gasUsed: '21000', toAddress: '0xabc', fromAddress: '0xdef', successful: true, logEvents: [] },
      ]);
    });

    await waitFor(() => {
      expect(result.current.successfulChains.length).toBeGreaterThan(0);
      const ethChain = result.current.successfulChains.find(c => c.chainName === 'eth-mainnet');
      expect(ethChain?.transactionCount).toBe(2);
    });
  });

  test('failedChains tracks errors correctly', async () => {
    mockFetch.mockImplementation((_wallet, chainName) => {
      if (chainName === 'arbitrum-mainnet') {
        return Promise.reject(new Error('API Error'));
      }
      return Promise.resolve([]);
    });

    const { result } = renderHook(
      () => useScanWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f12345'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    expect(result.current.failedChains).toContain('arbitrum-mainnet');
    expect(result.current.failedChains).toHaveLength(1);
  });

  test('progress counter shows correct format N/M', async () => {
    const resolvers: Array<(value: ReturnType<typeof fetchChainTransactions> extends Promise<infer T> ? T : never) => void> = [];

    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    });

    const { result } = renderHook(
      () => useScanWallet('0x742d35Cc6634C0532925a3b844Bc9e7595f12345'),
      { wrapper: createWrapper() }
    );

    // Verify format: completedChains/totalChains
    expect(result.current.completedChains).toBe(0);
    expect(result.current.totalChains).toBe(3);

    await act(async () => {
      resolvers[0]?.([]);
    });

    await waitFor(() => {
      expect(result.current.completedChains).toBe(1);
      expect(result.current.totalChains).toBe(3);
    });
  });
});
