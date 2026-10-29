// lib/criptoya.ts
// Cliente CryptoYa + Motor de Arbitraje Omnichaín

export interface Quote {
  ask: number;
  totalAsk: number;
  bid: number;
  totalBid: number;
  time: number;
}

export interface ExchangeQuotes {
  [exchange: string]: Quote;
}

export interface ArbitrageOpportunity {
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  grossSpreadPct: number;
  netSpreadPct: number;
  estimatedProfitARS: number;
  riskScore: number; // 0-100, higher better
  omnichainPath: string;
  timestamp: number;
}

const BASE = process.env.NEXT_PUBLIC_CRYPTOYA_BASE || "https://criptoya.com/api";

export async function fetchAggregated(coin: string, fiat: string, volume: number): Promise<ExchangeQuotes> {
  const url = `${BASE}/${coin}/${fiat}/${volume}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`CryptoYa error: ${res.status}`);
  const data = await res.json();
  // Filter invalid
  const valid: ExchangeQuotes = {};
  for (const [ex, q] of Object.entries(data)) {
    if (typeof q === "object" && q && "totalAsk" in q && "totalBid" in q && (q as Quote).totalAsk > 0 && (q as Quote).totalBid > 0) {
      valid[ex] = q as Quote;
    }
  }
  return valid;
}

export function detectArbitrages(
  quotes: ExchangeQuotes,
  pair: string,
  volume: number,
  minSpreadPct = 0.8
): ArbitrageOpportunity[] {
  const entries = Object.entries(quotes);
  if (entries.length < 2) return [];

  const opportunities: ArbitrageOpportunity[] = [];

  for (const [buyEx, buyQ] of entries) {
    for (const [sellEx, sellQ] of entries) {
      if (buyEx === sellEx) continue;
      const buyPrice = buyQ.totalAsk;
      const sellPrice = sellQ.totalBid;
      if (sellPrice <= buyPrice) continue;

      const gross = ((sellPrice - buyPrice) / buyPrice) * 100;
      // Estimate net after typical fees/slippage 0.3%
      const net = gross - 0.3;
      if (net < minSpreadPct) continue;

      const profitARS = (sellPrice - buyPrice) * volume;

      // Simple AI-like risk score
      const age = Date.now() / 1000 - Math.max(buyQ.time, sellQ.time);
      const freshness = Math.max(0, 100 - age / 10); // fresher better
      const liquidity = Math.min(100, (volume / 100) * 10);
      const riskScore = Math.round((freshness * 0.4 + liquidity * 0.3 + (net > 2 ? 30 : 15)));

      const omnichainPath = net > 1.5 
        ? `Buy ${buyEx} → Bridge USDT via LayerZero to Base → Sell on Uniswap V3 / or hold for on-chain arb`
        : `Local CEX transfer ${buyEx} → ${sellEx} (faster)`;

      opportunities.push({
        pair,
        buyExchange: buyEx,
        sellExchange: sellEx,
        buyPrice,
        sellPrice,
        volume,
        grossSpreadPct: Number(gross.toFixed(2)),
        netSpreadPct: Number(net.toFixed(2)),
        estimatedProfitARS: Number(profitARS.toFixed(0)),
        riskScore: Math.min(100, riskScore),
        omnichainPath,
        timestamp: Date.now()
      });
    }
  }

  return opportunities
    .sort((a, b) => b.netSpreadPct - a.netSpreadPct)
    .slice(0, 15);
}

export async function scanMultiplePairs(volumes: Record<string, number> = { USDT: 1000, BTC: 0.01, ETH: 0.5 }) {
  const pairs = [
    { coin: "USDT", fiat: "ARS", vol: volumes.USDT },
    { coin: "BTC", fiat: "ARS", vol: volumes.BTC },
    { coin: "ETH", fiat: "ARS", vol: volumes.ETH },
  ];

  const all: ArbitrageOpportunity[] = [];
  for (const p of pairs) {
    try {
      const quotes = await fetchAggregated(p.coin, p.fiat, p.vol);
      const opps = detectArbitrages(quotes, `${p.coin}/${p.fiat}`, p.vol);
      all.push(...opps);
    } catch (e) {
      console.error(`Error scanning ${p.coin}:`, e);
    }
  }
  return all.sort((a, b) => b.estimatedProfitARS - a.estimatedProfitARS);
}
