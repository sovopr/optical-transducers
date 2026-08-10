from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import qutip as qt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimParams(BaseModel):
    gam: float
    gmc: float
    kappaA: float
    gammaB: float
    kappaC: float
    ntraj: int = 1

@app.post("/api/simulate")
def simulate(params: SimParams):
    N = 4
    a_mode = qt.destroy(N)
    b_mode = qt.destroy(N)
    c_mode = qt.destroy(N)
    I = qt.qeye(N)

    a = qt.tensor(a_mode, I, I)
    b = qt.tensor(I, b_mode, I)
    c = qt.tensor(I, I, c_mode)

    H0 = 0 * a.dag() * a # interaction picture
    
    g_am = params.gam * 2 * np.pi
    g_mc = params.gmc * 2 * np.pi
    kappa_a = params.kappaA * 2 * np.pi
    gamma_b = params.gammaB * 2 * np.pi
    kappa_c = params.kappaC * 2 * np.pi

    H_int1 = g_am * (a.dag() * b + a * b.dag())
    H_int2 = g_mc * (b.dag() * c + b * c.dag())
    H = H0 + H_int1 + H_int2

    c_ops = [
        np.sqrt(kappa_a) * a,
        np.sqrt(gamma_b) * b,
        np.sqrt(kappa_c) * c
    ]

    psi0 = qt.tensor(qt.basis(N, 1), qt.basis(N, 0), qt.basis(N, 0))
    tlist = np.linspace(0, 10, 100) 
    e_ops = [a.dag() * a, b.dag() * b, c.dag() * c]

    # Use Monte Carlo solver to simulate individual quantum jumps!
    result = qt.mcsolve(H, psi0, tlist, c_ops=c_ops, e_ops=e_ops, ntraj=params.ntraj)

    n_a = result.expect[0]
    n_b = result.expect[1]
    n_c = result.expect[2]

    data = []
    for i, t in enumerate(tlist):
        data.append({
            "time": f"{t:.2f}",
            "microwave": float(n_a[i]),
            "mechanical": float(n_b[i]),
            "optical": float(n_c[i])
        })

    return {"data": data}
