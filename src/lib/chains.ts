import type { Chain } from './types';

/**
 * LiFi Diamond contract address.
 * All Jumper transactions go through this contract on every chain.
 * Same address on all EVM chains.
 */
export const LIFI_DIAMOND = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE';

/**
 * Supported chains for Jumper Points scanning.
 * Each chain must be supported by both Covalent GoldRush and LiFi.
 *
 * Chain names follow Covalent's naming convention: {network}-mainnet
 */
export const SUPPORTED_CHAINS: Chain[] = [
  // Major L1s
  { name: 'eth-mainnet', chainId: 1, displayName: 'Ethereum' },
  { name: 'bsc-mainnet', chainId: 56, displayName: 'BNB Chain' },
  { name: 'avalanche-mainnet', chainId: 43114, displayName: 'Avalanche' },
  { name: 'fantom-mainnet', chainId: 250, displayName: 'Fantom' },
  { name: 'matic-mainnet', chainId: 137, displayName: 'Polygon' },
  { name: 'gnosis-mainnet', chainId: 100, displayName: 'Gnosis' },
  { name: 'celo-mainnet', chainId: 42220, displayName: 'Celo' },
  { name: 'cronos-mainnet', chainId: 25, displayName: 'Cronos' },
  { name: 'kava-mainnet', chainId: 2222, displayName: 'Kava' },
  { name: 'harmony-mainnet', chainId: 1666600000, displayName: 'Harmony' },

  // Ethereum L2s (Optimistic Rollups)
  { name: 'arbitrum-mainnet', chainId: 42161, displayName: 'Arbitrum One' },
  { name: 'optimism-mainnet', chainId: 10, displayName: 'Optimism' },
  { name: 'base-mainnet', chainId: 8453, displayName: 'Base' },
  { name: 'mantle-mainnet', chainId: 5000, displayName: 'Mantle' },
  { name: 'metis-mainnet', chainId: 1088, displayName: 'Metis' },
  { name: 'boba-mainnet', chainId: 288, displayName: 'Boba' },
  { name: 'mode-mainnet', chainId: 34443, displayName: 'Mode' },
  { name: 'blast-mainnet', chainId: 81457, displayName: 'Blast' },
  { name: 'fraxtal-mainnet', chainId: 252, displayName: 'Fraxtal' },

  // Ethereum L2s (ZK Rollups)
  { name: 'zksync-mainnet', chainId: 324, displayName: 'zkSync Era' },
  { name: 'linea-mainnet', chainId: 59144, displayName: 'Linea' },
  { name: 'scroll-mainnet', chainId: 534352, displayName: 'Scroll' },
  { name: 'polygon-zkevm-mainnet', chainId: 1101, displayName: 'Polygon zkEVM' },
  { name: 'manta-mainnet', chainId: 169, displayName: 'Manta Pacific' },
  { name: 'taiko-mainnet', chainId: 167000, displayName: 'Taiko' },

  // Parachains / Sidechains
  { name: 'moonbeam-mainnet', chainId: 1284, displayName: 'Moonbeam' },
  { name: 'moonriver-mainnet', chainId: 1285, displayName: 'Moonriver' },
  { name: 'aurora-mainnet', chainId: 1313161554, displayName: 'Aurora' },
  { name: 'fuse-mainnet', chainId: 122, displayName: 'Fuse' },
  { name: 'klaytn-mainnet', chainId: 8217, displayName: 'Klaytn' },

  // Additional chains
  { name: 'evmos-mainnet', chainId: 9001, displayName: 'Evmos' },
  { name: 'core-mainnet', chainId: 1116, displayName: 'Core' },
  { name: 'sei-mainnet', chainId: 1329, displayName: 'Sei' },
  { name: 'zora-mainnet', chainId: 7777777, displayName: 'Zora' },
  { name: 'worldchain-mainnet', chainId: 480, displayName: 'World Chain' },
];
