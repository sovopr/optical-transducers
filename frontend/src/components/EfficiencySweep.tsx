import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function EfficiencySweep() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const [gam, setGam] = useState(0.5);
  const [kappaA, setKappaA] = useState(0.1);
  const [gammaB, setGammaB] = useState(0.01);
  const [kappaC, setKappaC] = useState(0.1);
  const [nThermal, setNThermal] = useState(0);

  useEffect(() => {
    const fetchSweep = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/sweep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gam, kappaA, gammaB, kappaC, nThermal,
            gmcMin: 0.05, gmcMax: 2.0, gmcSteps: 16,
          })
        });
        const json = await response.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Sweep failed", err);
      } finally {
        setLoading(false);
      }
    };
    const id = setTimeout(fetchSweep, 500);
    return () => clearTimeout(id);
  }, [gam, kappaA, gammaB, kappaC, nThermal]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="bg-quantum-card p-5 rounded-2xl border border-quantum-border">
          <h2 className="text-lg font-semibold mb-4 text-white">Sweep Parameters</h2>
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm mb-1.5 text-slate-300">
                <span>g_am (electromech.)</span>
                <span className="text-blue-400 font-mono">{gam}</span>
              </label>
              <input type="range" min={0} max={2} step={0.1} value={gam} onChange={e => setGam(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-sm mb-1.5 text-slate-300">
                <span>n̄_th (thermal)</span>
                <span className="text-amber-400 font-mono">{nThermal}</span>
              </label>
              <input type="range" min={0} max={20} step={1} value={nThermal} onChange={e => setNThermal(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <hr className="border-quantum-border" />
            <div>
              <label className="flex justify-between text-sm mb-1.5 text-slate-300">
                <span>κ_a</span><span className="text-slate-400 font-mono">{kappaA}</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={kappaA} onChange={e => setKappaA(Number(e.target.value))} className="w-full accent-slate-500" />
            </div>
            <div>
              <label className="flex justify-between text-sm mb-1.5 text-slate-300">
                <span>γ_b</span><span className="text-slate-400 font-mono">{gammaB}</span>
              </label>
              <input type="range" min={0} max={0.5} step={0.01} value={gammaB} onChange={e => setGammaB(Number(e.target.value))} className="w-full accent-slate-500" />
            </div>
            <div>
              <label className="flex justify-between text-sm mb-1.5 text-slate-300">
                <span>κ_c</span><span className="text-slate-400 font-mono">{kappaC}</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={kappaC} onChange={e => setKappaC(Number(e.target.value))} className="w-full accent-slate-500" />
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500">
            Sweeps g_mc from 0.05 to 2.0 MHz (16 QuTiP runs)
          </div>
        </div>

        {/* Efficiency chart */}
        <div className="lg:col-span-3 bg-quantum-card p-5 rounded-2xl border border-quantum-border flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Conversion Efficiency & Fidelity vs. Optomechanical Coupling</h2>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 min-h-[350px]">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Running {16} QuTiP simulations...
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
                  <XAxis dataKey="gmc" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                    label={{ value: 'g_mc / 2π (MHz)', position: 'insideBottomRight', offset: -5, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9', fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" name="η (Efficiency)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="fidelity" name="ℱ (Fidelity)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="addedNoise" name="n_add" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
