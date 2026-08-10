export default function Architecture() {
  return (
    <div className="bg-quantum-card p-8 rounded-2xl border border-quantum-border">
      <h2 className="text-2xl font-semibold mb-8 text-white">Dilution Refrigerator Architecture</h2>
      
      <div className="flex justify-center">
        <div className="w-full max-w-3xl relative">
          
          {/* Vertical Fiber Line */}
          <div className="absolute right-[112px] top-12 bottom-[100px] w-1 bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-0"></div>

          {/* 300K Stage */}
          <div className="border-t-4 border-slate-600 pt-2 pb-8 flex justify-between items-start relative z-10">
            <span className="text-lg font-bold text-orange-400">300K (Room Temperature)</span>
            <div className="bg-orange-900/40 border border-orange-500 p-3 rounded-lg text-orange-300 w-56 text-center shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              Laser Pump & Detectors
            </div>
          </div>
          
          {/* 50K Stage */}
          <div className="border-t-2 border-slate-600/60 pt-2 pb-12 ml-4">
            <span className="text-md text-yellow-400">50K Stage</span>
          </div>

          {/* 4K Stage */}
          <div className="border-t-2 border-slate-600/60 pt-2 pb-12 ml-8 flex justify-between items-start relative z-10">
            <span className="text-md text-sky-400">4K Stage</span>
            <div className="bg-slate-800 border border-slate-600 p-2 rounded-lg w-56 text-center text-sm text-slate-300">
              Optical Filtering & Attenuation
            </div>
          </div>

          {/* 100mK Stage */}
          <div className="border-t-2 border-slate-600/60 pt-2 pb-16 ml-12">
            <span className="text-md text-blue-400">100mK Stage</span>
          </div>

          {/* 15mK Stage */}
          <div className="border-t-2 border-slate-600/60 pt-2 pb-4 ml-16 relative z-10">
            <span className="text-lg font-bold text-indigo-400 block mb-6">15mK (Base Stage)</span>
            
            <div className="flex items-center justify-between">
              
              <div className="bg-blue-900/40 border border-blue-500 p-4 rounded-lg w-48 text-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <div className="text-blue-300 font-bold mb-1">Superconducting Qubit</div>
                <div className="text-xs text-blue-200/50">Transmon</div>
              </div>
              
              {/* Arrow */}
              <div className="flex flex-col items-center flex-1 px-4">
                <div className="text-xs text-slate-400 mb-2">Microwave (5GHz)</div>
                <div className="flex items-center w-full">
                  <div className="h-px bg-slate-500 flex-1"></div>
                  <div className="w-2 h-2 border-t border-r border-slate-500 transform rotate-45 -ml-1"></div>
                </div>
              </div>

              <div className="bg-emerald-900/40 border border-emerald-500 p-4 rounded-lg w-56 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-opacity-90">
                <div className="text-emerald-400 font-bold mb-1">Piezo-Optomechanical Transducer</div>
                <div className="text-xs text-emerald-200/50">LiNbO3 + Cavity</div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-12 text-slate-400 leading-relaxed max-w-3xl mx-auto">
        <p className="mb-4">
          This schematic illustrates the massive physical bottleneck in scaling quantum hardware. The superconducting qubit operates at 15 millikelvin. Traditionally, extracting the readout signal requires heavy, heat-conducting coaxial cables running all the way to room temperature.
        </p>
        <p>
          By implementing the Piezo-Optomechanical Transducer on the base plate, we upconvert the 5GHz microwave photon into a 1550nm optical photon. This signal is sent up through standard telecom fiber (red vertical line), which supports immense multiplexing and conducts negligible heat, solving the scaling constraint.
        </p>
      </div>
    </div>
  );
}
