"use client";

import { useEffect, useState } from "react";
import { scanMultiplePairs, ArbitrageOpportunity } from "../lib/criptoya";

export default function Home() {
  const [opps, setOpps] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await scanMultiplePairs();
      setOpps(data);
      setLastUpdate(new Date().toLocaleString("es-AR"));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // cada minuto, respeta rate limit CryptoYa
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          OmniArbYa
        </h1>
        <p className="text-zinc-400 mt-1">
          Experto en Arbitrajes · Alimentado por CryptoYa API · Omnichaín Engine by ElCryptoBoy
        </p>
        <p className="text-xs text-zinc-500 mt-2">Última actualización: {lastUpdate || "cargando..."}</p>
      </header>

      {loading && <div className="text-center py-20 text-emerald-400">Escaneando exchanges LATAM...</div>}

      <div className="grid gap-4">
        {opps.map((o, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl font-bold text-emerald-400">{o.netSpreadPct}%</span>
                <span className="ml-3 text-zinc-400">{o.pair}</span>
              </div>
              <span className="text-sm px-3 py-1 bg-zinc-800 rounded-full">
                Risk Score: {o.riskScore}/100
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>Buy: <span className="text-cyan-300">{o.buyExchange}</span> @ {o.buyPrice.toLocaleString("es-AR")}</div>
              <div>Sell: <span className="text-amber-300">{o.sellExchange}</span> @ {o.sellPrice.toLocaleString("es-AR")}</div>
              <div>Vol: {o.volume}</div>
              <div className="text-emerald-300 font-semibold">Profit ~ ${o.estimatedProfitARS.toLocaleString("es-AR")} ARS</div>
            </div>
            <div className="mt-3 text-xs text-zinc-500">
              Path omnichaín: {o.omnichainPath}
            </div>
            <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium">
              Generar Calldata Settlement
            </button>
          </div>
        ))}
      </div>

      {opps.length === 0 && !loading && (
        <div className="text-center py-20 text-zinc-500">
          No se encontraron oportunidades con spread > 0.8% en este momento.
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-zinc-600">
        OmniArbYa · ElCryptoBoy Web3 Omnichain Solutions · Layers 0-1-2-3 · IA + Smart Contracts + Fintech
      </footer>
    </div>
  );
}
