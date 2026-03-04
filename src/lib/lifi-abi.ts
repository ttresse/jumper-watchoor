/**
 * LiFi contract event ABI definitions for viem decoding.
 *
 * These events are emitted by the LiFi Diamond contract (0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE)
 * and used to classify transactions as bridges or swaps.
 *
 * Source: https://github.com/lifinance/contracts/blob/main/src/Interfaces/ILiFi.sol
 */

/**
 * LiFi events ABI for decoding transaction logs.
 *
 * - LiFiTransferStarted: Emitted when a bridge transfer begins, contains destinationChainId
 * - LiFiTransferCompleted: Emitted when a bridge transfer completes on destination
 * - LiFiGenericSwapCompleted: Emitted for same-chain swaps
 */
export const LIFI_EVENTS_ABI = [
  {
    type: 'event',
    name: 'LiFiTransferStarted',
    inputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        indexed: false,
        components: [
          { name: 'transactionId', type: 'bytes32' },
          { name: 'bridge', type: 'string' },
          { name: 'integrator', type: 'string' },
          { name: 'referrer', type: 'address' },
          { name: 'sendingAssetId', type: 'address' },
          { name: 'receiver', type: 'address' },
          { name: 'minAmount', type: 'uint256' },
          { name: 'destinationChainId', type: 'uint256' },
          { name: 'hasSourceSwaps', type: 'bool' },
          { name: 'hasDestinationCall', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'LiFiTransferCompleted',
    inputs: [
      { name: 'transactionId', type: 'bytes32', indexed: true },
      { name: 'receivingAssetId', type: 'address', indexed: false },
      { name: 'receiver', type: 'address', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'LiFiGenericSwapCompleted',
    inputs: [
      { name: 'transactionId', type: 'bytes32', indexed: true },
      { name: 'integrator', type: 'string', indexed: false },
      { name: 'referrer', type: 'string', indexed: false },
      { name: 'receiver', type: 'address', indexed: false },
      { name: 'fromAssetId', type: 'address', indexed: false },
      { name: 'toAssetId', type: 'address', indexed: false },
      { name: 'fromAmount', type: 'uint256', indexed: false },
      { name: 'toAmount', type: 'uint256', indexed: false },
    ],
  },
] as const;
