import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Metrics {
  fidelity: number;
  addedNoise: number;
  maxEfficiency: number;
  peakTime: number;
}

export default function PhysicsSim() {
  const [gam, setGam] = useState(0.5);
  const [gmc, setGmc] = useState(0.5);
  const [kappaA, setKappaA] = useState(0.1);
  const [gammaB, setGammaB] = useState(0.01);
  const [kappaC, setKappaC] = useState(0.1);
  const [nThermal, setNThermal] = useState(0);
  const [ntraj, setNtraj] = useState(1);

  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Wigner function state
  const [wignerData, setWignerData] = useState<{ xvec: number[]; W: number[][]; wMin: number; wMax: number; time: number } | null>(null);
  const [wignerLoading, setWignerLoading] = useState(false);

  // Fetch simulation
  useEffect(() => {
    const fetchSimulation = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gam, gmc, kappaA, gammaB, kappaC, nThermal, ntraj })
        });
        const json = await response.json();
        setData(json.data || []);
        setMetrics(json.metrics || null);
      } catch (err) {
        console.error("Simulation failed", err);
      } finally {
        setLoading(false);
      }
    };
    const id = setTimeout(fetchSimulation, 600);
    return () => clearTimeout(id);
  }, [gam, gmc, kappaA, gammaB, kappaC, nThermal, ntraj]);

  // Fetch Wigner function
  useEffect(() => {
    const fetchWigner = async () => {
      setWignerLoading(true);
      try {
        const response = await fetch('/api/wigner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gam, gmc, kappaA, gammaB, kappaC, nThermal })
        });
        const json = await response.json();
        setWignerData(json);
      } catch (err) {
        console.error("Wigner fetch failed", err);
      } finally {
        setWignerLoading(false);
      }
    };
    const id = setTimeout(fetchWigner, 800);
    return () => clearTimeout(id);
  }, [gam, gmc, kappaA, gammaB, kappaC, nThermal]);

  // Render Wigner heatmap to canvas
  useEffect(() => {
    if (!wignerData) return;
    const canvas = document.getElementById('wigner-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { xvec, W, wMin, wMax } = wignerData;
    const size = xvec.length;
    canvas.width = size;
    canvas.height = size;

    const range = Math.max(Math.abs(wMin), Math.abs(wMax)) || 1;

    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const val = W[j][i];
        const norm = val / range; // -1 to 1

        let r: number, g: number, b: number;
        if (norm < 0) {
          // Negative = blue/purple (non-classical!)
          const t = Math.min(Math.abs(norm), 1);
          r = Math.round(60 + 80 * t);
          g = Math.round(20);
          b = Math.round(120 + 135 * t);
        } else {
          // Positive = orange/yellow
          const t = Math.min(norm, 1);
          r = Math.round(255 * t);
          g = Math.round(160 * t + 40);
          b = Math.round(30);
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i, size - 1 - j, 1, 1);
      }
    }
  }, [wignerData]);

  return (
    <div className="space-y-8">
      {/* Top row: Controls + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-quantum-bg/60 flex items-center justify-center z-50 rounded-2xl backdrop-blur-sm">
            <div className="text-white bg-quantum-card px-6 py-3 rounded-full border border-blue-500/50 flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Solving Master Equation...
            </div>
          </div>
        )}

        {/* Parameter controls */}
        <div className="bg-quantum-card p-5 rounded-2xl border border-quantum-border">
          <h2 className="text-lg font-semibold mb-4 text-white">System Parameters</h2>
          <div className="space-y-4">
            <SliderControl label="Monte Carlo Trajectories" value={ntraj} min={1} max={100} step={1} onChange={setNtraj} color="purple" hint="1 = quantum jumps" />
            <hr className="border-quantum-border" />
            <SliderControl label="g_mc (optomech.)" value={gmc} min={0} max={2} step={0.1} onChange={setGmc} color="blue" />
            <SliderControl label="g_am (electromech.)" value={gam} min={0} max={2} step={0.1} onChange={setGam} color="blue" />
            <hr className="border-quantum-border" />
            <SliderControl label="n_th (thermal phonons)" value={nThermal} min={0} max={20} step={1} onChange={setNThermal} color="amber" hint="Bath occupation" />
            <hr className="border-quantum-border" />
            <SliderControl label="κ_a (MW decay)" value={kappaA} min={0} max={1} step={0.05} onChange={setKappaA} color="slate" />
            <SliderControl label="γ_b (mech. decay)" value={gammaB} min={0} max={0.5} step={0.01} onChange={setGammaB} color="slate" />
            <SliderControl label="κ_c (opt. decay)" value={kappaC} min={0} max={1} step={0.05} onChange={setKappaC} color="slate" />
          </div>
        </div>

        {/* Main chart */}
        <div className="lg:col-span-2 bg-quantum-card p-5 rounded-2xl border border-quantum-border flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-white">State Transfer Dynamics</h2>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Time (µs)', position: 'insideBottomRight', offset: -5, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: '⟨n⟩', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9', fontSize: 12 }} />
                <Legend />
                <Line type="stepAfter" dataKey="microwave" name="⟨â†â⟩ Microwave" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="mechanical" name="⟨b̂†b̂⟩ Mechanical" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="optical" name="⟨ĉ†ĉ⟩ Optical" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics panel */}
        <div className="bg-quantum-card p-5 rounded-2xl border border-quantum-border flex flex-col justify-between">
          <h2 className="text-lg font-semibold mb-4 text-white">Quantum Metrics</h2>
          <div className="space-y-4 flex-1">
            <MetricCard label="Conversion Efficiency η" value={metrics ? `${(metrics.maxEfficiency * 100).toFixed(1)}%` : '—'} sub="max ⟨ĉ†ĉ⟩ / ⟨â†â⟩₀" color="blue" />
            <MetricCard label="State Fidelity ℱ" value={metrics ? metrics.fidelity.toFixed(4) : '—'} sub="⟨1_c|ρ_c|1_c⟩ at peak" color="emerald" />
            <MetricCard label="Added Noise n_add" value={metrics ? metrics.addedNoise.toFixed(4) : '—'} sub="Vacuum-input optical noise" color="rose" />
            <MetricCard label="Peak Transfer Time" value={metrics ? `${metrics.peakTime} µs` : '—'} sub="Time of max η" color="amber" />
          </div>
        </div>
      </div>

      {/* Bottom row: Wigner function */}
      <div className="bg-quantum-card p-5 rounded-2xl border border-quantum-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Wigner Quasi-Probability Distribution</h2>
            <p className="text-sm text-slate-500 mt-1">Optical cavity reduced state in phase space — negative regions (purple) indicate non-classicality</p>
          </div>
          {wignerData && (
            <div className="text-right text-sm text-slate-400">
              <div>t = {wignerData.time} µs</div>
              <div className="flex gap-4 mt-1">
                <span className="text-purple-400">W_min = {wignerData.wMin.toFixed(4)}</span>
                <span className="text-amber-400">W_max = {wignerData.wMax.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          {wignerLoading ? (
            <div className="h-[320px] flex items-center justify-center text-slate-500">Computing Wigner function...</div>
          ) : (
            <div className="relative">
              <canvas id="wigner-canvas" className="w-[320px] h-[320px] rounded-xl border border-quantum-border" style={{ imageRendering: 'pixelated' }} />
              {/* Axis labels */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">Re(α)</div>
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">Im(α)</div>
              {/* Color legend */}
              <div className="absolute -right-28 top-1/2 -translate-y-1/2 space-y-1 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ background: '#ff9e1e' }}></div><span className="text-slate-400">W &gt; 0</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ background: '#1e1e1e' }}></div><span className="text-slate-400">W ≈ 0</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ background: '#8c14ff' }}></div><span className="text-slate-400">W &lt; 0</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SliderControl({ label, value, min, max, step, onChange, color, hint }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string; hint?: string;
}) {
  return (
    <div>
      <label className="flex justify-between text-sm mb-1.5 text-slate-300">
        <span>{label}</span>
        <span className={`text-${color}-400 font-mono`}>{value}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full accent-${color}-500`} />
      {hint && <div className="text-xs text-slate-600 mt-0.5">{hint}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className={`p-3 bg-${color}-900/20 rounded-xl border border-${color}-500/30`}>
      <div className={`text-xs text-${color}-300 mb-1`}>{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
