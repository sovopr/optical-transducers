# Piezo-Optomechanical Quantum Transducer: Full-Stack Open Quantum System Simulator

An interactive simulation platform for modeling microwave-to-optical quantum state transduction via a piezo-optomechanical interface. The system solves the Lindblad master equation and Monte Carlo quantum trajectories in real time using [QuTiP](https://qutip.org), with a React-based frontend for parameter exploration and visualization.

This project addresses a central challenge in scaling superconducting quantum processors: the efficient, low-noise conversion of microwave readout signals to optical frequencies for long-distance quantum communication and cryogenic wiring reduction.

---

## Table of Contents

1. [Motivation](#motivation)
2. [Theoretical Framework](#theoretical-framework)
3. [System Architecture](#system-architecture)
4. [Installation and Usage](#installation-and-usage)
5. [Simulation Modules](#simulation-modules)
6. [References](#references)

---

## Motivation

Superconducting transmon qubits operate at microwave frequencies (~5 GHz) inside dilution refrigerators at temperatures of ~15 mK. Current readout architectures require individual coaxial cables per qubit, routed from the millikelvin stage to room temperature. This approach faces two fundamental scaling limits:

1. **Thermal load**: Each coaxial line conducts heat into the cryostat, and the cooling power of a dilution refrigerator at 15 mK is on the order of ~10 µW. Scaling to thousands of qubits would exceed available cooling budgets.
2. **Physical space**: The volume of cabling becomes prohibitive for processors exceeding ~1000 qubits.

A piezo-optomechanical transducer offers a solution by converting the 5 GHz microwave signal into a 1550 nm optical signal. Standard telecom fiber can then carry the readout to room-temperature detectors with negligible heat conduction and massive multiplexing capability [1, 2].

---

## Theoretical Framework

### The Three-Mode System

The transducer couples three bosonic modes:

| Mode | Operator | Physical Realization | Frequency |
|------|----------|---------------------|-----------|
| Microwave cavity | $\hat{a}$ | Superconducting LC resonator | ~5 GHz |
| Mechanical resonator | $\hat{b}$ | Piezoelectric acoustic mode (e.g., LiNbO₃) | ~5 GHz |
| Optical cavity | $\hat{c}$ | Fabry-Pérot or photonic crystal cavity | ~194 THz (1550 nm) |

### Hamiltonian

The full optomechanical Hamiltonian, including radiation pressure coupling, is:

$$\hat{H}_{\text{full}} = \hbar\omega_a \hat{a}^\dagger \hat{a} + \hbar\omega_b \hat{b}^\dagger \hat{b} + \hbar\omega_c \hat{c}^\dagger \hat{c} + \hbar g_0^{(am)} \hat{a}^\dagger \hat{a}(\hat{b} + \hat{b}^\dagger) + \hbar g_0^{(mc)} \hat{c}^\dagger \hat{c}(\hat{b} + \hat{b}^\dagger)$$

Under strong coherent driving of both the microwave and optical cavities, and applying the rotating wave approximation (RWA), the interaction reduces to the **linearized beam-splitter Hamiltonian** in the interaction picture [3, 4]:

$$\hat{H}_{\text{int}} = \hbar g_{am}(\hat{a}^\dagger \hat{b} + \hat{a}\hat{b}^\dagger) + \hbar g_{mc}(\hat{b}^\dagger \hat{c} + \hat{b}\hat{c}^\dagger)$$

where $g_{am} = g_0^{(am)} \sqrt{\bar{n}_a}$ and $g_{mc} = g_0^{(mc)} \sqrt{\bar{n}_c}$ are the enhanced coupling rates, proportional to the square root of the intracavity photon numbers of the respective pump fields.

### Lindblad Master Equation

The system is open: each mode couples to its own thermal bath. The density matrix $\rho$ evolves according to:

$$\frac{d\rho}{dt} = -\frac{i}{\hbar}[\hat{H}_{\text{int}}, \rho] + \sum_k \mathcal{D}[\hat{L}_k]\rho$$

where the Lindblad dissipator is:

$$\mathcal{D}[\hat{L}]\rho = \hat{L}\rho\hat{L}^\dagger - \frac{1}{2}\left(\hat{L}^\dagger\hat{L}\rho + \rho\hat{L}^\dagger\hat{L}\right)$$

The collapse operators $\hat{L}_k$ encode both energy loss and thermal noise:

| Collapse Operator | Process |
|-------------------|---------|
| $\sqrt{\kappa_a}\,\hat{a}$ | Microwave photon emission |
| $\sqrt{\gamma_b(1 + \bar{n}_{\text{th}})}\,\hat{b}$ | Mechanical phonon emission (spontaneous + stimulated) |
| $\sqrt{\gamma_b \bar{n}_{\text{th}}}\,\hat{b}^\dagger$ | Thermal phonon absorption from the bath |
| $\sqrt{\kappa_c}\,\hat{c}$ | Optical photon emission |

Here $\bar{n}_{\text{th}} = [\exp(\hbar\omega_b / k_B T) - 1]^{-1}$ is the Bose-Einstein thermal occupation of the mechanical bath. Even at 15 mK, a 5 GHz mechanical mode has $\bar{n}_{\text{th}} \approx 0.01$, but laser-induced heating can raise the effective bath temperature dramatically [5].

### Monte Carlo Quantum Trajectories

As an alternative to the master equation, the Monte Carlo wavefunction method (MCWF) simulates individual quantum trajectories. Between stochastic collapse events, the system evolves under a non-Hermitian effective Hamiltonian:

$$\hat{H}_{\text{eff}} = \hat{H}_{\text{int}} - \frac{i\hbar}{2}\sum_k \hat{L}_k^\dagger \hat{L}_k$$

At each timestep, a random number determines whether a quantum jump occurs. Over many trajectories, the ensemble average converges to the master equation solution. A single trajectory reveals the discrete, stochastic nature of quantum measurement — the photon "jumps" between modes [6].

### Key Metrics

**Conversion Efficiency:**

$$\eta = \frac{\max_t \langle \hat{c}^\dagger\hat{c} \rangle(t)}{\langle \hat{a}^\dagger\hat{a} \rangle(0)}$$

**Quantum State Fidelity:**

$$\mathcal{F} = \langle 1_c | \hat{\rho}_c(t_{\text{peak}}) | 1_c \rangle$$

where $\hat{\rho}_c = \text{Tr}_{a,b}[\hat{\rho}]$ is the reduced density matrix of the optical cavity, evaluated at the time of peak conversion.

**Added Noise Quanta:**

$$n_{\text{add}} = \max_t \langle \hat{c}^\dagger\hat{c} \rangle_{\text{vacuum input}}$$

This represents the noise floor: the optical photon number produced by the transducer even when no signal is present at the input, originating from thermal phonons leaking through the conversion chain.

### Wigner Quasi-Probability Distribution

The Wigner function provides a complete phase-space representation of the quantum state:

$$W(\alpha) = \frac{2}{\pi} \text{Tr}\left[\hat{D}^\dagger(\alpha)\hat{\rho}\hat{D}(\alpha)(-1)^{\hat{n}}\right]$$

where $\hat{D}(\alpha)$ is the displacement operator. For a classical state (coherent, thermal), $W(\alpha) \geq 0$ everywhere. **Negative values of the Wigner function are a definitive signature of non-classicality** — they indicate the quantum nature of the transduced state has been preserved through the conversion [7].

### Thermal Backaction

The optical pump laser introduces thermal phonons into the mechanical mode. These phonons leak backwards through the electromechanical coupling, inducing an additional decoherence rate on the microwave cavity:

$$\Gamma_{\text{induced}} \approx \frac{g_{am}^2 \bar{n}_{\text{th}}}{\gamma_b / 2}$$

This represents the fundamental tension in transducer design: increasing pump power improves conversion efficiency but degrades qubit coherence [8].

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Physics  │ │Efficiency│ │Backaction│ │Architecture│  │
│  │   Sim    │ │  Sweep   │ │ Analysis │ │ Schematic  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────────┘  │
│       │             │            │                       │
│       ▼             ▼            ▼                       │
│  ┌─────────────────────────────────────┐                │
│  │         Vite Dev Proxy → :8000      │                │
│  └─────────────────┬───────────────────┘                │
└────────────────────┼────────────────────────────────────┘
                     │  HTTP POST (JSON)
┌────────────────────┼────────────────────────────────────┐
│                    ▼                                     │
│            FastAPI Backend (Python)                      │
│                                                         │
│  ┌──────────────────────────────────────────────┐       │
│  │              QuTiP Engine                     │       │
│  │                                               │       │
│  │  • Hilbert space: N=4 ⊗ N=4 ⊗ N=4 (64-dim)  │       │
│  │  • mesolve: density matrix evolution          │       │
│  │  • mcsolve: Monte Carlo trajectories          │       │
│  │  • wigner: phase-space distribution           │       │
│  │  • ptrace: reduced density matrices           │       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  Endpoints:                                             │
│    POST /api/simulate   → trajectories + metrics        │
│    POST /api/wigner     → phase-space distribution      │
│    POST /api/sweep      → η, ℱ, n_add vs g_mc          │
│    POST /api/backaction → metrics vs n̄_th               │
└─────────────────────────────────────────────────────────┘
```

---

## Installation and Usage

### Prerequisites

- Python 3.10+ with `pip`
- Node.js 18+ with `npm`

### 1. Backend (Physics Engine)

```bash
pip install fastapi uvicorn pydantic qutip numpy

cd backend
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 2. Frontend (Dashboard)

```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Simulation Modules

### Physics Simulation
Interactive Monte Carlo and master equation simulation with real-time parameter control. Features:
- Adjustable coupling strengths ($g_{am}$, $g_{mc}$), decay rates ($\kappa_a$, $\gamma_b$, $\kappa_c$), and thermal bath occupation ($\bar{n}_{\text{th}}$)
- Live quantum metrics: conversion efficiency $\eta$, state fidelity $\mathcal{F}$, added noise $n_{\text{add}}$
- Wigner function heatmap of the optical output state in phase space
- Trajectory count control: single quantum jump visualization to ensemble-averaged dynamics

### Efficiency Sweep
Parametric sweep of the optomechanical coupling rate $g_{mc}$ (equivalent to scanning the optical pump power). Plots conversion efficiency, state fidelity, and added noise as functions of coupling strength.

### Backaction Analysis
Simulates the degradation of transducer performance with increasing thermal phonon occupation. Computes:
- Fidelity and efficiency vs. $\bar{n}_{\text{th}}$
- Added noise quanta vs. $\bar{n}_{\text{th}}$
- Induced qubit decoherence rate $\Gamma_{\text{induced}}$ vs. $\bar{n}_{\text{th}}$

### Architecture Schematic
Visual representation of the dilution refrigerator thermal stages (300K → 50K → 4K → 100mK → 15mK), component placement, and fiber optic routing.

---

## References

1. Mirhosseini, M., et al. "Superconducting qubit to optical photon transduction." *Nature* **588**, 599–603 (2020).
2. Jiang, W., et al. "Efficient bidirectional piezo-optomechanical transduction between microwave and optical frequency." *Nature Communications* **11**, 1166 (2020).
3. Aspelmeyer, M., Kippenberg, T. J., & Marquardt, F. "Cavity optomechanics." *Reviews of Modern Physics* **86**, 1391 (2014).
4. Andrews, R. W., et al. "Bidirectional and efficient conversion between microwave and optical light." *Nature Physics* **10**, 321–326 (2014).
5. Meenehan, S. M., et al. "Pulsed excitation dynamics of an optomechanical crystal resonator near its quantum ground state of motion." *Physical Review X* **5**, 041002 (2015).
6. Daley, A. J. "Quantum trajectories and open many-body quantum systems." *Advances in Physics* **63**, 77–149 (2014).
7. Kenfack, A. & Życzkowski, K. "Negativity of the Wigner function as an indicator of non-classicality." *Journal of Optics B* **6**, 396 (2004).
8. Safavi-Naeini, A. H. & Painter, O. "Proposal for an optomechanical traveling wave phonon-photon translator." *New Journal of Physics* **13**, 013017 (2011).

---

## License

MIT License. See [LICENSE](LICENSE) for details.
