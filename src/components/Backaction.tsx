import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function Backaction() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const gam = 0.5;
  const gmc = 0.5;
  const kappaA = 0.1;
  const gammaB = 0.01;
  const kappaC = 0.1;

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
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Explanation */}
        <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border">
          <h2 className="text-xl font-semibold mb-4 text-rose-400">The Backaction Trade-off</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Optical transducers solve the wiring bottleneck but introduce <strong>thermal backaction</strong>. 
            This panel shows <em>real simulated data</em> from the QuTiP backend — not hardcoded values.
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

        {/* Fidelity vs n_th */}
        <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Fidelity & Efficiency vs. Thermal Phonons</h2>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Running backaction simulation...</div>
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
      </div>

      {/* Added noise and induced decoherence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Added Noise Quanta vs. Thermal Phonons</h2>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <div className="flex-1 min-h-[280px]">
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

        <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">Induced Qubit Decoherence Rate</h2>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>
          ) : (
            <div className="flex-1 min-h-[280px]">
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
  );
}
