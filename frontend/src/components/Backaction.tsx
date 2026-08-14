import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function Backaction() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const [gam, setGam] = useState(0.5);
  const [gmc, setGmc] = useState(0.5);
  const [kappaA, setKappaA] = useState(0.1);
  const [gammaB, setGammaB] = useState(0.01);
  const [kappaC, setKappaC] = useState(0.1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/backaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gam, gmc, kappaA, gammaB, kappaC,
            nThermalMin: 0, nThermalMax: 40, nThermalSteps: 15,
          })
        });
        const json = await response.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Backaction fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    const id = setTimeout(fetchData, 500);
    return () => clearTimeout(id);
  }, [gam, gmc, kappaA, gammaB, kappaC]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Controls Panel */}
      <div className="bg-quantum-card p-5 rounded-2xl border border-quantum-border space-y-4 h-fit">
        <h2 className="text-lg font-semibold mb-4 text-white">System Parameters</h2>
        <div>
          <label className="flex justify-between text-sm mb-1.5 text-slate-300">
            <span>g_am (electromech.)</span>
            <span className="text-blue-400 font-mono">{gam}</span>
          </label>
          <input type="range" min={0} max={2} step={0.1} value={gam} onChange={e => setGam(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label className="flex justify-between text-sm mb-1.5 text-slate-300">
            <span>g_mc (optomech.)</span>
            <span className="text-blue-400 font-mono">{gmc}</span>
          </label>
          <input type="range" min={0} max={2} step={0.1} value={gmc} onChange={e => setGmc(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label className="flex justify-between text-sm mb-1.5 text-slate-300">
            <span>κ_a (MW decay)</span>
            <span className="text-slate-400 font-mono">{kappaA}</span>
          </label>
          <input type="range" min={0.01} max={1} step={0.01} value={kappaA} onChange={e => setKappaA(Number(e.target.value))} className="w-full accent-slate-500" />
        </div>
        <div>
          <label className="flex justify-between text-sm mb-1.5 text-slate-300">
            <span>γ_b (mech. decay)</span>
            <span className="text-slate-400 font-mono">{gammaB}</span>
          </label>
          <input type="range" min={0.01} max={1} step={0.01} value={gammaB} onChange={e => setGammaB(Number(e.target.value))} className="w-full accent-slate-500" />
        </div>
        <div>
          <label className="flex justify-between text-sm mb-1.5 text-slate-300">
            <span>κ_c (opt. decay)</span>
            <span className="text-slate-400 font-mono">{kappaC}</span>
          </label>
          <input type="range" min={0.01} max={1} step={0.01} value={kappaC} onChange={e => setKappaC(Number(e.target.value))} className="w-full accent-slate-500" />
        </div>
        <div className="pt-4 mt-4 border-t border-quantum-border text-xs text-slate-500">
          Sweeps n̄_th from 0 to 40 (15 QuTiP runs)
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Explanation */}
        <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border">
          <h2 className="text-xl font-semibold mb-4 text-rose-400">The Backaction Trade-off</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Optical transducers solve the wiring bottleneck but introduce <strong>thermal backaction</strong>. 
            This panel shows <em>real simulated data</em> from the QuTiP backend.
          </p>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li className="flex gap-3">
              <span className="text-rose-500 font-bold shrink-0">1.</span>
              <span><strong>Stray Photons:</strong> 1550nm optical photons carry ~0.8 eV — exceeding the ~1 meV superconducting gap of Nb/Al. A single stray photon breaks Cooper pairs, causing immediate quasiparticle poisoning and decoherence.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-500 font-bold shrink-0">2.</span>
              <span><strong>Thermal Phonons:</strong> The laser pump heats the transducer, generating thermal phonons with occupation n̄_th. These leak backwards through the electromechanical coupling into the microwave cavity, inducing a decoherence rate Γ_induced ∝ g²_am · n̄_th / γ_b.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500 font-bold shrink-0">3.</span>
              <span><strong>Mitigation:</strong> Physical separation (flip-chip bonding), heavy optical filtering at 4K, and pulsed pump protocols to minimize time-averaged thermal load.</span>
            </li>
          </ul>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Fidelity vs n_th */}
          <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-white">Fidelity & Efficiency vs. Thermal Phonons</h2>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 min-h-[300px]">Simulating...</div>
            ) : (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
                    <XAxis dataKey="nThermal" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                      label={{ value: 'n̄_th (thermal phonons)', position: 'insideBottomRight', offset: -5, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9', fontSize: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="fidelity" name="Fidelity ℱ" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="efficiency" name="Efficiency η" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Added noise */}
          <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-white">Added Noise Quanta vs. Thermal Phonons</h2>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 min-h-[300px]">Simulating...</div>
            ) : (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
                    <XAxis dataKey="nThermal" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                      label={{ value: 'n_add', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9', fontSize: 12 }} />
                    <Line type="monotone" dataKey="addedNoise" name="n_add" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Induced decoherence */}
          <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-white">Induced Qubit Decoherence Rate</h2>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 min-h-[250px]">Simulating...</div>
            ) : (
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
                    <XAxis dataKey="nThermal" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }}
                      label={{ value: 'Γ_induced (MHz)', angle: -90, position: 'insideLeft', fill: '#f59e0b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9', fontSize: 12 }} />
                    <Line type="monotone" dataKey="inducedDecoherence" name="Γ_induced" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
