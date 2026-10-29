# OmniArbYa - ElCryptoBoy Omnichain Arbitrage Engine

**Experto en Arbitrajes alimentado por CryptoYa API**

Solución omnichaín completa que combina:

- Datos en tiempo real de CryptoYa (exchanges LATAM, P2P, ARS/USD)
- Detección de oportunidades de arbitraje CEX-CEX, CEX-P2P, fiat
- Scoring con IA heurística (riesgo, liquidez, volatilidad)
- Simulación de ejecución omnichaín (LayerZero / CCIP / CCTP)
- Smart Contract de settlement y profit escrow en Base / Polygon / Arbitrum
- Frontend Next.js 15 + TypeScript + Tailwind listo para Vercel
- Arquitectura Layers 0-1-2-3 ready

## Arquitectura

```
[CryptoYa API] --> [Arb Detector Engine] --> [AI Risk Scorer]
                                      |
                                      v
                            [Omnichain Router]
                         (LayerZero / Wormhole)
                                      |
                                      v
                     [Smart Contract Settlement]
                    (Profit distribution + fees)
                                      |
                                      v
                         [Next.js Dashboard + Alerts]
```

## Features

- Polling cada 60s de múltiples pares (USDT/ARS, BTC/ARS, ETH/ARS, USDC/ARS)
- Cálculo de spread neto usando totalAsk / totalBid (incluye fees)
- Ranking de mejores oportunidades
- Estimación de profit después de gas + bridge fees
- Botones de "Execute Path" que generan calldata para el contrato
- Dark mode, responsive, wallet connect ready (RainbowKit placeholder)

## Setup Local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Deploy

1. Push a este repo
2. Importar en Vercel
3. Set env NEXT_PUBLIC_CRYPTOYA_BASE=https://criptoya.com/api

## Smart Contract

Ver `contracts/ArbSettlement.sol`

Compilar con Foundry o Hardhat. Deploy en Base Sepolia para test.

---

**ElCryptoBoy** - Arquitecto Web3 Omnichaín  
Combinando IA + Crypto + Blockchain + Fintech + Tokens + Smart Contracts + Layers 0-1-2-3
