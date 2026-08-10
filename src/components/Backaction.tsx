import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Backaction() {
  const data = [
    { power: '0.1µW', decoherence: 0.5, conversion: 2 },
    { power: '1µW', decoherence: 1.2, conversion: 15 },
    { power: '10µW', decoherence: 4.5, conversion: 45 },
    { power: '100µW', decoherence: 25.0, conversion: 85 },
    { power: '1mW', decoherence: 95.0, conversion: 98 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border">
        <h2 className="text-xl font-semibold mb-4 text-rose-400">The Backaction Trade-off</h2>
        <p className="text-slate-300 leading-relaxed mb-6">
          While optical transducers solve the wiring bottleneck, they introduce a lethal new problem for superconducting qubits: <strong>Optical Backaction</strong>.
        </p>
        <ul className="space-y-4 text-slate-400">
          <li className="flex gap-3">
            <span className="text-rose-500 font-bold">1.</span>
            <span><strong>Stray Photons:</strong> 1550nm photons carry ~0.8 eV of energy, vastly exceeding the ~1 meV superconducting gap of Niobium/Aluminum. A single stray photon striking the qubit will break Cooper pairs and cause immediate decoherence.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">2.</span>
            <span><strong>Thermal Phonons:</strong> The laser pump heating the transducer chip generates thermal phonons. If the transducer is on the same chip as the qubit, these phonons will traverse the substrate and destroy the fragile quantum state.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold">3.</span>
            <span><strong>The Solution:</strong> Physical separation (flip-chip bonding or separate substrates connected by microwave waveguides) and heavy optical filtering at the 4K stage to ensure pump photons do not leak down the fiber.</span>
          </li>
        </ul>
      </div>

      <div className="bg-quantum-card p-6 rounded-2xl border border-quantum-border flex flex-col">
        <h2 className="text-xl font-semibold mb-6 text-white">Pump Power vs. Decoherence Rate</h2>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232b40" />
              <XAxis dataKey="power" stroke="#64748b" />
              <YAxis yAxisId="left" orientation="left" stroke="#ef4444" label={{ value: 'Added Decoherence Rate (kHz)', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Conversion Eff. (%)', angle: 90, position: 'insideRight', fill: '#10b981' }} />
              <Tooltip contentStyle={{ backgroundColor: '#151b2b', borderColor: '#232b40' }} />
              <Bar yAxisId="left" dataKey="decoherence" name="Decoherence" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="conversion" name="Conversion Efficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
