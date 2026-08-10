import { useState } from 'react';
import PhysicsSim from './components/PhysicsSim';
import Architecture from './components/Architecture';
import Backaction from './components/Backaction';
import { Activity, Layers, Thermometer } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('physics');

  return (
    <div className="min-h-screen bg-quantum-bg text-slate-200 font-sans p-8">
      <header className="mb-12 border-b border-quantum-border pb-6">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Quantum Transducer Dashboard</h1>
        <p className="text-slate-400 text-lg">Piezo-optomechanical microwave-to-optical conversion simulator</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('physics')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'physics' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-quantum-card border border-quantum-border hover:bg-slate-800'}`}
        >
          <Activity size={20} />
          Physics Simulation
        </button>
        <button 
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'architecture' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-quantum-card border border-quantum-border hover:bg-slate-800'}`}
        >
          <Layers size={20} />
          Architecture Schematic
        </button>
        <button 
          onClick={() => setActiveTab('backaction')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'backaction' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 'bg-quantum-card border border-quantum-border hover:bg-slate-800'}`}
        >
          <Thermometer size={20} />
          Backaction Analysis
        </button>
      </div>

      <main className="transition-opacity duration-500">
        {activeTab === 'physics' && <PhysicsSim />}
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'backaction' && <Backaction />}
      </main>
    </div>
  );
}
