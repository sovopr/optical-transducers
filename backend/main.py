from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import qutip as qt
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def build_system(params: dict):
    """
    Construct the full 3-mode Hilbert space operators, Hamiltonian,
    and collapse operators including thermal noise.
    """
    N = 4
    I = qt.qeye(N)

    a = qt.tensor(qt.destroy(N), I, I)
    b = qt.tensor(I, qt.destroy(N), I)
    c = qt.tensor(I, I, qt.destroy(N))

    g_am  = params["gam"]    * 2 * np.pi
    g_mc  = params["gmc"]    * 2 * np.pi
    k_a   = params["kappaA"] * 2 * np.pi
    g_b   = params["gammaB"] * 2 * np.pi
    k_c   = params["kappaC"] * 2 * np.pi
    n_th  = params.get("nThermal", 0.0)

    # Interaction-picture Hamiltonian (beam-splitter couplings)
    H = g_am * (a.dag() * b + a * b.dag()) + g_mc * (b.dag() * c + b * c.dag())

    # Collapse operators with thermal noise on the mechanical mode
    c_ops = [
        np.sqrt(k_a) * a,                          # microwave photon loss
        np.sqrt(g_b * (1 + n_th)) * b,              # mechanical phonon loss (stimulated + spontaneous)
        np.sqrt(g_b * n_th) * b.dag(),               # thermal phonon absorption from bath
        np.sqrt(k_c) * c,                           # optical photon loss
    ]

    return N, a, b, c, H, c_ops


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class SimParams(BaseModel):
    gam: float
    gmc: float
    kappaA: float
    gammaB: float
    kappaC: float
    nThermal: float = 0.0
    ntraj: int = 1


class SweepParams(BaseModel):
    gam: float
    kappaA: float
    gammaB: float
    kappaC: float
    nThermal: float = 0.0
    gmcMin: float = 0.05
    gmcMax: float = 2.0
    gmcSteps: int = 20


class BackactionParams(BaseModel):
    gam: float
    gmc: float
    kappaA: float
    gammaB: float
    kappaC: float
    nThermalMin: float = 0.0
    nThermalMax: float = 50.0
    nThermalSteps: int = 15


class WignerParams(BaseModel):
    gam: float
    gmc: float
    kappaA: float
    gammaB: float
    kappaC: float
    nThermal: float = 0.0
    timeIndex: Optional[int] = None  # if None, use time of max optical population


# ---------------------------------------------------------------------------
# /api/simulate  —  Monte Carlo or Master Equation trajectories
# ---------------------------------------------------------------------------

@app.post("/api/simulate")
def simulate(params: SimParams):
    N, a, b, c, H, c_ops = build_system(params.model_dump())

    psi0 = qt.tensor(qt.basis(N, 1), qt.basis(N, 0), qt.basis(N, 0))
    tlist = np.linspace(0, 10, 200)
    e_ops = [a.dag() * a, b.dag() * b, c.dag() * c]

    result = qt.mcsolve(H, psi0, tlist, c_ops=c_ops, e_ops=e_ops, ntraj=params.ntraj)

    n_a = result.expect[0]
    n_b = result.expect[1]
    n_c = result.expect[2]

    # --- Compute quantum metrics ---
    # For fidelity and added noise, run a single mesolve pass (density matrix)
    result_dm = qt.mesolve(H, psi0, tlist, c_ops=c_ops, e_ops=[])

    # Find time of max optical population
    peak_idx = int(np.argmax(n_c))
    rho_peak = result_dm.states[peak_idx]

    # Reduced density matrix of optical cavity at peak transfer time
    rho_c = rho_peak.ptrace(2)

    # Fidelity: overlap with |1⟩ Fock state in the optical cavity
    target = qt.basis(N, 1)
    fidelity = float(qt.expect(target * target.dag(), rho_c))

    # Added noise quanta: run simulation with vacuum input (no photon)
    psi0_vac = qt.tensor(qt.basis(N, 0), qt.basis(N, 0), qt.basis(N, 0))
    result_vac = qt.mesolve(H, psi0_vac, tlist, c_ops=c_ops, e_ops=[c.dag() * c])
    n_add = float(np.max(result_vac.expect[0]))

    # Max conversion efficiency
    max_eff = float(np.max(n_c))

    data = []
    for i, t in enumerate(tlist):
        data.append({
            "time": round(float(t), 3),
            "microwave": float(n_a[i]),
            "mechanical": float(n_b[i]),
            "optical": float(n_c[i])
        })

    return {
        "data": data,
        "metrics": {
            "fidelity": round(fidelity, 4),
            "addedNoise": round(n_add, 4),
            "maxEfficiency": round(max_eff, 4),
            "peakTime": round(float(tlist[peak_idx]), 3),
        }
    }


# ---------------------------------------------------------------------------
# /api/wigner  —  Wigner function of optical output in phase space
# ---------------------------------------------------------------------------

@app.post("/api/wigner")
def wigner(params: WignerParams):
    N, a, b, c, H, c_ops = build_system(params.model_dump())

    psi0 = qt.tensor(qt.basis(N, 1), qt.basis(N, 0), qt.basis(N, 0))
    tlist = np.linspace(0, 10, 200)

    result = qt.mesolve(H, psi0, tlist, c_ops=c_ops, e_ops=[c.dag() * c])

    # Pick the time index
    if params.timeIndex is not None:
        idx = min(params.timeIndex, len(tlist) - 1)
    else:
        idx = int(np.argmax(result.expect[0]))

    rho_full = result.states[idx]
    rho_c = rho_full.ptrace(2)  # reduced optical density matrix

    # Compute Wigner function
    xvec = np.linspace(-3, 3, 81)
    W = qt.wigner(rho_c, xvec, xvec)

    return {
        "xvec": xvec.tolist(),
        "W": W.tolist(),
        "time": round(float(tlist[idx]), 3),
        "wMin": round(float(np.min(W)), 6),
        "wMax": round(float(np.max(W)), 6),
    }


# ---------------------------------------------------------------------------
# /api/sweep  —  Conversion efficiency & fidelity vs coupling strength
# ---------------------------------------------------------------------------

@app.post("/api/sweep")
def sweep(params: SweepParams):
    gmc_values = np.linspace(params.gmcMin, params.gmcMax, params.gmcSteps)
    N = 4
    I = qt.qeye(N)

    a_op = qt.tensor(qt.destroy(N), I, I)
    b_op = qt.tensor(I, qt.destroy(N), I)
    c_op = qt.tensor(I, I, qt.destroy(N))

    k_a  = params.kappaA * 2 * np.pi
    g_b  = params.gammaB * 2 * np.pi
    k_c  = params.kappaC * 2 * np.pi
    g_am = params.gam    * 2 * np.pi
    n_th = params.nThermal

    psi0 = qt.tensor(qt.basis(N, 1), qt.basis(N, 0), qt.basis(N, 0))
    psi0_vac = qt.tensor(qt.basis(N, 0), qt.basis(N, 0), qt.basis(N, 0))
    tlist = np.linspace(0, 10, 200)
    target = qt.basis(N, 1)

    c_ops_base = [
        np.sqrt(k_a) * a_op,
        np.sqrt(g_b * (1 + n_th)) * b_op,
        np.sqrt(g_b * n_th) * b_op.dag(),
        np.sqrt(k_c) * c_op,
    ]

    results = []
    for gmc_val in gmc_values:
        g_mc = gmc_val * 2 * np.pi
        H = g_am * (a_op.dag() * b_op + a_op * b_op.dag()) + g_mc * (b_op.dag() * c_op + b_op * c_op.dag())

        # Signal run
        res = qt.mesolve(H, psi0, tlist, c_ops=c_ops_base, e_ops=[c_op.dag() * c_op])
        max_eff = float(np.max(res.expect[0]))

        # Fidelity at peak
        peak_idx = int(np.argmax(res.expect[0]))
        rho_c = res.states[peak_idx].ptrace(2)
        fidelity = float(qt.expect(target * target.dag(), rho_c))

        # Noise run (vacuum input)
        res_vac = qt.mesolve(H, psi0_vac, tlist, c_ops=c_ops_base, e_ops=[c_op.dag() * c_op])
        n_add = float(np.max(res_vac.expect[0]))

        results.append({
            "gmc": round(float(gmc_val), 3),
            "efficiency": round(max_eff, 4),
            "fidelity": round(fidelity, 4),
            "addedNoise": round(n_add, 4),
        })

    return {"data": results}


# ---------------------------------------------------------------------------
# /api/backaction  —  Qubit decoherence vs thermal phonon occupation
# ---------------------------------------------------------------------------

@app.post("/api/backaction")
def backaction(params: BackactionParams):
    n_th_values = np.linspace(params.nThermalMin, params.nThermalMax, params.nThermalSteps)

    N = 4
    I = qt.qeye(N)

    a_op = qt.tensor(qt.destroy(N), I, I)
    b_op = qt.tensor(I, qt.destroy(N), I)
    c_op = qt.tensor(I, I, qt.destroy(N))

    k_a  = params.kappaA * 2 * np.pi
    g_b  = params.gammaB * 2 * np.pi
    k_c  = params.kappaC * 2 * np.pi
    g_am = params.gam    * 2 * np.pi
    g_mc = params.gmc    * 2 * np.pi

    H = g_am * (a_op.dag() * b_op + a_op * b_op.dag()) + g_mc * (b_op.dag() * c_op + b_op * c_op.dag())

    psi0 = qt.tensor(qt.basis(N, 1), qt.basis(N, 0), qt.basis(N, 0))
    psi0_vac = qt.tensor(qt.basis(N, 0), qt.basis(N, 0), qt.basis(N, 0))
    tlist = np.linspace(0, 10, 200)
    target = qt.basis(N, 1)

    results = []
    for n_th in n_th_values:
        c_ops = [
            np.sqrt(k_a) * a_op,
            np.sqrt(g_b * (1 + n_th)) * b_op,
            np.sqrt(g_b * n_th) * b_op.dag(),
            np.sqrt(k_c) * c_op,
        ]

        # Signal
        res = qt.mesolve(H, psi0, tlist, c_ops=c_ops, e_ops=[c_op.dag() * c_op, a_op.dag() * a_op])
        max_eff = float(np.max(res.expect[0]))

        # Fidelity
        peak_idx = int(np.argmax(res.expect[0]))
        rho_c = res.states[peak_idx].ptrace(2)
        fidelity = float(qt.expect(target * target.dag(), rho_c))

        # Added noise
        res_vac = qt.mesolve(H, psi0_vac, tlist, c_ops=c_ops, e_ops=[c_op.dag() * c_op])
        n_add = float(np.max(res_vac.expect[0]))

        # Qubit T1 degradation estimate:
        # Extra thermal phonons leak backwards through the electromechanical coupling
        # into the microwave cavity, inducing a decoherence rate ~ g_am^2 * n_th / gamma_b
        gamma_induced = (g_am**2 * n_th) / (g_b / 2 + 1e-12) / (2 * np.pi)  # convert back from angular

        results.append({
            "nThermal": round(float(n_th), 2),
            "efficiency": round(max_eff, 4),
            "fidelity": round(fidelity, 4),
            "addedNoise": round(n_add, 4),
            "inducedDecoherence": round(float(gamma_induced), 4),
        })

    return {"data": results}
