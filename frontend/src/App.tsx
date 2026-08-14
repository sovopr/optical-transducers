import { useState } from 'react';
import PhysicsSim from './components/PhysicsSim';
import Architecture from './components/Architecture';
import Backaction from './components/Backaction';
import EfficiencySweep from './components/EfficiencySweep';
import { Activity, Layers, Thermometer, TrendingUp } from 'lucide-react';

const tabs = [
  { id: 'physics', label: 'Simulation', icon: Activity, activeColor: 'blue' },
  { id: 'sweep', label: 'Efficiency Sweep', icon: TrendingUp, activeColor: 'purple' },
  { id: 'backaction', label: 'Backaction Analysis', icon: Thermometer, activeColor: 'rose' },
  { id: 'architecture', label: 'Architecture', icon: Layers, activeColor: 'emerald' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState('physics');

  return (
    <div className="min-h-screen bg-quantum-bg text-slate-200 font-sans p-6 lg:p-8">
      <header className="mb-10 border-b border-quantum-border pb-5">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
          Piezo-Optomechanical Quantum Transducer
        </h1>
        <p className="text-slate-500 text-sm lg:text-base">
          Full-stack open quantum system simulator — QuTiP Master Equation & Monte Carlo backends
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map(({ id, label, icon: Icon, activeColor }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? `bg-${activeColor}-600/20 text-${activeColor}-400 border border-${activeColor}-500/30`
                : 'bg-quantum-card border border-quantum-border hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <main>
        {activeTab === 'physics' && <PhysicsSim />}
        {activeTab === 'sweep' && <EfficiencySweep />}
        {activeTab === 'backaction' && <Backaction />}
        {activeTab === 'architecture' && <Architecture />}
      </main>
    </div>
  );
}
