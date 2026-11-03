/**
 * The only pages that show these addresses. Both businesses receive to the
 * same wallets, so each pay page names both. Keep in sync with the copy of
 * this file on the sister site (SHARED_WALLET_SITE).
 */
export const CRYPTO_PAY_PAGES = [
  "https://fromaitobusiness.com/coaching/pay",
  "https://defiuniversity.xyz/coaching/pay",
] as const;

export const EVM_CHAINS = ["Ethereum", "Base", "Arbitrum"] as const;

export type CryptoNetwork = "evm" | "solana" | "bitcoin";

export interface CryptoReceiveAddress {
  network: CryptoNetwork;
  asset: string;
  caption: string;
  address: string;
}

export const CRYPTO_NETWORK_LABEL: Record<CryptoNetwork, string> = {
  evm: "Ethereum, Base or Arbitrum",
  solana: "Solana",
  bitcoin: "Bitcoin",
};

export const CRYPTO_RECEIVE_ADDRESSES: readonly CryptoReceiveAddress[] = [
  {
    network: "evm",
    asset: "USDC or USDT",
    caption: "USDC or USDT on Ethereum, Base, or Arbitrum.",
    address: "0x356aa473344c07F650eb3a2C5Bd7D8A261aDe6e1",
  },
  {
    network: "solana",
    asset: "USDC or USDT",
    caption: "USDC or USDT on Solana.",
    address: "jknKFWNNok4oB2yabhybMrdvmRtwgZsWRXf7yNToxqM",
  },
  {
    network: "bitcoin",
    asset: "BTC",
    caption: "On-chain Bitcoin. Not Lightning.",
    address: "bc1q5rrkxtsshz5q9dzu0uurnn50e4jwse6fvfdu6c",
  },
] as const;

export function cryptoAddress(network: CryptoNetwork): string {
  switch (network) {
    case "evm":
    case "solana":
    case "bitcoin": {
      const row = CRYPTO_RECEIVE_ADDRESSES.find((item) => item.network === network);
      if (!row) throw new Error(`Missing crypto address for ${network}`);
      return row.address;
    }
    default: {
      const _exhaustive: never = network;
      throw new Error(`Unknown crypto network: ${String(_exhaustive)}`);
    }
  }
}

export function isCryptoNetwork(value: string): value is CryptoNetwork {
  switch (value) {
    case "evm":
    case "solana":
    case "bitcoin":
      return true;
    default:
      return false;
  }
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

/** Shape checks. EIP-55 and bech32 checksums are verified by scripts/test-crypto-addresses.py. */
export function assertCryptoAddressShapes(): void {
  const evm = cryptoAddress("evm");
  const solana = cryptoAddress("solana");
  const bitcoin = cryptoAddress("bitcoin");
  if (!/^0x[0-9a-fA-F]{40}$/.test(evm)) {
    throw new Error("EVM address shape is wrong");
  }
  if (solana.length < 32 || solana.length > 44 || !BASE58.test(solana)) {
    throw new Error("Solana address shape is wrong");
  }
  if (!bitcoin.startsWith("bc1q") || bitcoin !== bitcoin.toLowerCase()) {
    throw new Error("Bitcoin address shape is wrong");
  }
}

/**
 * The other business that receives to these wallets. A transfer credited
 * there must not be confirmed here too, so the admin confirm screen links to
 * its notices list.
 */
export const SHARED_WALLET_SITE = {
  name: "DeFi University",
  noticesUrl: "https://defiuniversity.xyz/admin/coaching/crypto-notices",
} as const;

/** Block explorer links for the coach to check a transfer. */
export function explorerUrls(network: CryptoNetwork, txHash: string): string[] {
  const hash = encodeURIComponent(txHash.trim());
  switch (network) {
    case "evm":
      return [
        `https://etherscan.io/tx/${hash}`,
        `https://basescan.org/tx/${hash}`,
        `https://arbiscan.io/tx/${hash}`,
      ];
    case "solana":
      return [`https://solscan.io/tx/${hash}`];
    case "bitcoin":
      return [`https://mempool.space/tx/${hash}`];
    default: {
      const exhaustive: never = network;
      return [String(exhaustive)];
    }
  }
}
