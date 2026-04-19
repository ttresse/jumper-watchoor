/**
 * Static mapping of EVM chain IDs to display names.
 * Covers major LiFi-supported chains.
 * Fallback for unknown chains: "Chain {id}".
 */

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  25: 'Cronos',
  56: 'BNB Chain',
  100: 'Gnosis',
  106: 'Velas',
  122: 'Fuse',
  137: 'Polygon',
  250: 'Fantom',
  288: 'Boba',
  324: 'zkSync Era',
  1088: 'Metis',
  1101: 'Polygon zkEVM',
  1284: 'Moonbeam',
  1285: 'Moonriver',
  2222: 'Kava',
  5000: 'Mantle',
  7171: 'Bitrock',
  8453: 'Base',
  34443: 'Mode',
  42161: 'Arbitrum',
  42170: 'Arbitrum Nova',
  42220: 'Celo',
  43114: 'Avalanche',
  59144: 'Linea',
  81457: 'Blast',
  111188: 're.al',
  167000: 'Taiko',
  534352: 'Scroll',
  7777777: 'Zora',
  1380012617: 'RARI Chain',
};

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}
