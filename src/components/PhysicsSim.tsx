import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PhysicsSim() {
  const [gam, setGam] = useState(0.5);
  const [gmc, setGmc] = useState(0.5);
  const [kappaA, setKappaA] = useState(0.1);
  const [gammaB, setGammaB] = useState(0.01);
  const [kappaC, setKappaC] = useState(0.1);
  const [ntraj, setNtraj] = useState(1);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulation = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gam, gmc, kappaA, gammaB, kappaC, ntraj })
        });
        const json = await response.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Simulation failed", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSimulation, 500);
    return () => clearTimeout(timeoutId);
  }, [gam, gmc, kappaA, gammaB, kappaC, ntraj]);

  const maxOptical = data.length > 0 ? Math.max(...data.map(d => d.optical)).toFixed(3) : "0.000";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-quantum-bg/50 flex items-center justify-center z-50 rounded-2xl">
          <div className="text-white bg-quantum-card px-6 py-3 rounded-full border border-blue-500/50 flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Running Monte Carlo Simulation...
          </div>
        </div>
      )}

      <div className="col-span-1 bg-quantum-card p-6 rounded-2xl border border-quantum-border relative z-10">
        <h2 className="text-xl font-semibold mb-6 text-white">System Parameters</h2>
        
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Trajectories (1 = Jumps, 100 = Average)</span>
              <span className="text-purple-400 font-mono">{ntraj}</span>
            </label>
            <input type="range" min="1" max="100" step="1" value={ntraj} onChange={e => setNtraj(Number(e.target.value))} className="w-full accent-purple-500" />
            <div className="text-xs text-slate-500 mt-1">Set to 1 to see individual random photon jumps!</div>
          </div>
          <hr className="border-quantum-border" />
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Optomechanical Coupling (g_mc)</span>
              <span className="text-blue-400 font-mono">{gmc}</span>
            </label>
            <input type="range" min="0" max="2" step="0.1" value={gmc} onChange={e => setGmc(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Electromechanical Coupling (g_am)</span>
              <span className="text-blue-400 font-mono">{gam}</span>
            </label>
            <input type="range" min="0" max="2" step="0.1" value={gam} onChange={e => setGam(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <hr className="border-quantum-border" />
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Microwave Decay (κ_a)</span>
              <span className="text-slate-400 font-mono">{kappaA}</span>
            </label>
            <input type="range" min="0" max="1" step="0.05" value={kappaA} onChange={e => setKappaA(Number(e.target.value))} className="w-full accent-slate-500" />
          </div>
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Mechanical Decay (γ_b)</span>
              <span className="text-slate-400 font-mono">{gammaB}</span>
            </label>
            <input type="range" min="0" max="0.5" step="0.01" value={gammaB} onChange={e => setGammaB(Number(e.target.value))} className="w-full accent-slate-500" />
          </div>
          <div>
            <label className="flex justify-between text-sm mb-2 text-slate-300">
              <span>Optical Decay (κ_c)</span>
              <span className="text-slate-400 font-mono">{kappaC}</span>
            </label>
            <input type="range" min="0" max="1" step="0.05" value={kappaC} onChange={e => setKappaC(Number(e.target.value))} className="w-full accent-slate-500" />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
          <div className="text-sm text-blue-300 mb-1">Max Conversion Efficiency</div>
          <div className="text-3xl font-bold text-white">{(Number(maxOptical) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col relative z-10">
        <h2 className="text-xl font-semibold mb-6 text-white">Monte Carlo Trajectories (QuTiP mcsolve)</h2>
        <div className="flex-1 min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
              <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b'}} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="stepAfter" dataKey="microwave" name="Microwave (a)" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="mechanical" name="Mechanical (b)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="optical" name="Optical (c)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
