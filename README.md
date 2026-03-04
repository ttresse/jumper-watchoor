# Jumper Watcher

Track your Jumper Exchange XP points instantly. Enter any wallet address to scan transactions across 60+ chains, see your monthly breakdown by category (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR), and get recommendations to reach the next tier.

## Features

- **Multi-chain scanning** — Scans all 60+ chains supported by Jumper Exchange
- **Transaction classification** — Automatically detects bridges vs swaps
- **Monthly breakdown** — See your XP by category for each month
- **Tier recommendations** — Know exactly what to do to reach the next tier
- **Historical prices** — Dollar amounts calculated at transaction time
- **Configurable tiers** — Adjust point rules to match any updates

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TailwindCSS](https://tailwindcss.com) 4
- [Tanstack Query](https://tanstack.com/query) for data fetching
- [Zustand](https://zustand.docs.pmnd.rs) for state management
- [Viem](https://viem.sh) for EVM utilities

## Getting Started

### Prerequisites

- Node.js 20+

### Installation

```bash
git clone https://github.com/yourusername/jumper-watcher.git
cd jumper-watcher
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## How It Works

1. User enters an EVM wallet address
2. App queries Covalent API for transactions to the LiFi Diamond contract (`0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`) across all chains
3. Transactions are classified as bridge (cross-chain) or swap (same-chain)
4. Historical token prices are fetched from DefiLlama
5. Points are calculated using Jumper's tier system
6. Results are displayed with monthly breakdown and recommendations

## API Credits

- [LiFi](https://docs.li.fi/) — Multi-chain LiFi transaction 

## License

MIT License — see [LICENSE](LICENSE) for details.
