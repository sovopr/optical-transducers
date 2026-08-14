# Piezo-Optomechanical Quantum Transducer

### Full-Stack Open Quantum System Simulator

An interactive simulation platform for modeling microwave-to-optical quantum state transduction via a piezo-optomechanical interface. The system solves the Lindblad master equation and Monte Carlo quantum trajectories in real time using [QuTiP](https://qutip.org), with a React-based frontend for parameter exploration and visualization.

---

## Table of Contents

1.  [What This Project Does (Plain English)](#what-this-project-does-plain-english)
2.  [Why It Matters](#why-it-matters)
3.  [Features at a Glance](#features-at-a-glance)
4.  [Detailed Feature Walkthrough](#detailed-feature-walkthrough)
5.  [Theoretical Framework](#theoretical-framework)
6.  [System Architecture](#system-architecture)
7.  [Tech Stack](#tech-stack)
8.  [Installation and Usage](#installation-and-usage)
9.  [API Reference](#api-reference)
10. [Project Structure](#project-structure)
11. [References](#references)
12. [License](#license)

---

## What This Project Does (Plain English)

Imagine you have a quantum computer. It is locked inside a giant refrigerator that is colder than outer space (15 millikelvin — that is 0.015 degrees above absolute zero). The computer's brain, a tiny chip called a **transmon qubit**, thinks in **microwaves** — the same kind of radiation your WiFi router uses, just at a much higher frequency (5 GHz).

Now, you need to read the qubit's answer. The standard way is to run a metal cable from the chip, through the refrigerator walls, all the way out to your desk. The problem? Each cable leaks heat back into the fridge. One cable is fine. Ten is fine. But a useful quantum computer needs **thousands** of qubits, and thousands of cables would melt the entire fridge.

**The solution: convert microwaves to light.**

This project simulates a device called a **piezo-optomechanical transducer** — a tiny chip that takes the qubit's 5 GHz microwave whisper and converts it into a 1550 nm infrared light beam (the same wavelength used by internet fiber optic cables). Light can travel up a hair-thin glass fiber with practically zero heat leakage, and a single fiber can carry many signals at once.

The conversion works in three steps:

1. **Microwave photon** hits a tiny antenna (superconducting cavity)
2. That antenna vibrates a **piezoelectric crystal** (mechanical resonator — like a tuning fork made of lithium niobate)
3. The vibrating crystal shakes a **laser beam** inside an optical cavity, stamping the quantum information onto a photon of light

This simulator lets you tweak every physical parameter of that three-step chain and watch — in real time — how well the quantum signal survives the journey. It answers the question: *"If I build this device with these specifications, how much of the quantum information actually makes it through?"*

---

## Why It Matters

> **The Scaling Bottleneck of Quantum Computing**

| Problem | Detail |
|---------|--------|
| **Heat** | Each coaxial readout cable conducts ~1 µW of heat. A dilution refrigerator at 15 mK can only remove ~10 µW total. At ~1000 qubits, the fridge overheats. |
| **Space** | Thousands of bulky coaxial cables simply do not fit through the refrigerator's thermal stages. |
| **Distance** | Microwaves cannot travel long distances without massive loss. For quantum networking between cities, you need photons in optical fiber. |

A piezo-optomechanical transducer solves all three problems simultaneously. This simulator lets researchers and students explore the physics of that solution interactively, without needing access to a real cryogenic lab.

---

## Features at a Glance

| Feature | What It Does | Why It Matters |
|---------|--------------|----------------|
| **Monte Carlo Trajectories** | Simulates individual quantum "histories" where photons randomly jump between modes | Shows the stochastic, discrete nature of quantum mechanics — not just smooth averages |
| **Master Equation Solver** | Computes the ensemble-averaged density matrix evolution via the Lindblad equation | Gives the statistically exact prediction of what a real experiment would measure |
| **Thermal Noise Injection** | Adds realistic thermal phonons to the mechanical mode | Models the #1 real-world noise source: laser-induced heating of the mechanical element |
| **Wigner Function Heatmap** | Renders the quantum state's phase-space distribution on an HTML5 canvas | Negative regions prove the output is genuinely quantum — not a classical fake |
| **Quantum State Fidelity** | Measures how close the output is to a perfect single-photon Fock state | The gold-standard metric for quantum information preservation |
| **Added Noise Quanta** | Measures optical noise when no input signal is present | Quantifies the noise floor — critical for single-photon-level transduction |
| **Efficiency Sweep** | Scans the optomechanical coupling strength across a range, plotting all metrics | Lets you find the "sweet spot" for laser pump power |
| **Backaction Analysis** | Sweeps thermal phonon count and computes induced qubit decoherence | Visualizes the fundamental tradeoff: stronger coupling = better conversion but more noise |
| **Architecture Schematic** | Interactive diagram of a dilution refrigerator's thermal stages | Shows exactly where the transducer sits and why fiber optics solves the wiring problem |
| **Real-Time Parameter Control** | Sliders for all 7 physical parameters with live re-simulation | Instant feedback loop for building physical intuition |

---

## Detailed Feature Walkthrough

### Tab 1: Physics Simulation

This is the main simulation dashboard. It runs two solvers back-to-back:

**What you see:**
- A **time-domain trajectory chart** showing the photon/phonon population of all three modes (microwave, mechanical, optical) over 10 µs of simulated time
- A **Wigner function heatmap** of the optical cavity's quantum state at the moment of peak conversion
- Four **quantum metric cards** displaying conversion efficiency (η), state fidelity (F), added noise quanta, and peak transfer time
- Seven **parameter sliders** for coupling strengths, decay rates, thermal phonon count, and number of Monte Carlo trajectories

**Technical detail:**
The trajectory chart uses QuTiP's `mcsolve` (Monte Carlo wavefunction method). This solver randomly collapses the wavefunction at each timestep based on the collapse operators, producing jagged, stochastic trajectories. With 1 trajectory, you see individual quantum jumps. With 100+, you get smooth curves that converge to the master equation prediction.

The metrics (fidelity, added noise) are computed separately using `mesolve` (the deterministic Lindblad master equation solver) because they require the full density matrix — not just expectation values. The fidelity is computed by partially tracing out the microwave and mechanical modes from the full 64-dimensional density matrix, then projecting the resulting 4×4 optical density matrix onto the single-photon Fock state.

**Plain English:**
You drag sliders, the quantum computer simulation reruns in real time, and you see exactly how the signal bounces from the microwave chip → through the vibrating crystal → into the light beam. The colored cards tell you: "This configuration would convert 87% of the quantum information, but the noise floor is 0.03 photons."

---

### Tab 2: Efficiency Sweep

**What you see:**
- A multi-line chart plotting three curves against optomechanical coupling strength (g_mc):
  - **Conversion efficiency** (η) — how much of the input photon makes it to the optical output
  - **State fidelity** (F) — how "quantum" the output still is
  - **Added noise** (n_add) — how many fake photons appear from thermal noise

**Technical detail:**
This endpoint runs 16-20 separate QuTiP `mesolve` simulations, one for each value of g_mc in the sweep range. Each simulation constructs the full three-mode Hilbert space (4⊗4⊗4 = 64 dimensions), evolves the Lindblad master equation over 200 timesteps, and computes the peak optical population, the fidelity via partial trace, and the added noise via a separate vacuum-input simulation.

Sweeping g_mc is physically equivalent to sweeping the optical pump laser power, since the enhanced coupling rate scales as the square root of intracavity photon number.

**Plain English:**
"What happens if I turn the laser power up from 1% to 100%?" This tab answers that question. You see that conversion improves as you crank the laser, but at some point, the noise starts climbing too — because a stronger laser heats the crystal more. This is the fundamental tension in transducer design, and this plot lets you find the optimal operating point.

---

### Tab 3: Backaction Analysis

**What you see:**
- Four charts plotted against thermal phonon number (n_th):
  - **Fidelity vs. thermal phonons** — how quantum fidelity degrades with heating
  - **Efficiency vs. thermal phonons** — how conversion efficiency changes
  - **Added noise vs. thermal phonons** — how the noise floor rises
  - **Induced qubit decoherence rate** — how fast the qubit loses its information due to backflowing phonons

**Technical detail:**
The backaction mechanism works as follows: the optical pump laser, while enabling the optomechanical coupling, also heats the mechanical mode by injecting thermal phonons. These phonons do not just degrade the optical output — they also leak *backwards* through the electromechanical coupling into the microwave cavity, actively destroying the qubit's quantum state. The induced decoherence rate is:

$$\Gamma_{\text{induced}} \approx \frac{g_{am}^2 \bar{n}_{\text{th}}}{\gamma_b / 2}$$

Each data point in these plots is a full QuTiP simulation with modified collapse operators that include the thermal absorption channel.

**Plain English:**
"What if the laser heats the crystal?" This tab shows the damage. As thermal noise rises, every metric gets worse — fidelity drops, noise climbs, and the qubit itself starts to decohere faster. The induced decoherence chart is especially important: it tells you how much your transducer is *hurting* the very qubit it is trying to read. This is the #1 engineering challenge in the field right now.

---

### Tab 4: Architecture Schematic

**What you see:**
- A visual diagram of a dilution refrigerator showing all five thermal stages:
  - **300K** (room temperature) — laser sources and photodetectors
  - **50K** — first cooling stage
  - **4K** — optical filtering and attenuation
  - **100mK** — intermediate stage
  - **15mK** (base plate) — the superconducting qubit and the transducer
- A glowing red vertical line representing the optical fiber running from the base plate to room temperature
- An arrow showing the microwave signal path from qubit to transducer

**Plain English:**
This is a map of the refrigerator. The qubit lives at the very bottom where it is coldest. The transducer sits right next to it, converts the signal to light, and sends it straight up through a glass fiber (the red line). Instead of running heavy metal cables through every stage, one thin fiber does the job — and it barely conducts any heat at all.

---

## Theoretical Framework

### The Three-Mode System

The transducer couples three bosonic modes:

| Mode | Operator | Physical Realization | Frequency |
|------|----------|---------------------|-----------|
| Microwave cavity | â | Superconducting LC resonator | ~5 GHz |
| Mechanical resonator | b̂ | Piezoelectric acoustic mode (e.g., LiNbO₃) | ~5 GHz |
| Optical cavity | ĉ | Fabry-Pérot or photonic crystal cavity | ~194 THz (1550 nm) |

### Hamiltonian

The full optomechanical Hamiltonian, including radiation pressure coupling, is:

$$\hat{H}_{\text{full}} = \hbar\omega_a \hat{a}^\dagger \hat{a} + \hbar\omega_b \hat{b}^\dagger \hat{b} + \hbar\omega_c \hat{c}^\dagger \hat{c} + \hbar g_0^{(am)} \hat{a}^\dagger \hat{a}(\hat{b} + \hat{b}^\dagger) + \hbar g_0^{(mc)} \hat{c}^\dagger \hat{c}(\hat{b} + \hat{b}^\dagger)$$

Under strong coherent driving of both the microwave and optical cavities, and applying the rotating wave approximation (RWA), the interaction reduces to the **linearized beam-splitter Hamiltonian** in the interaction picture [3, 4]:

$$\hat{H}_{\text{int}} = \hbar g_{am}(\hat{a}^\dagger \hat{b} + \hat{a}\hat{b}^\dagger) + \hbar g_{mc}(\hat{b}^\dagger \hat{c} + \hat{b}\hat{c}^\dagger)$$

where the enhanced coupling rates are defined as:

$$g_{am} = g_0^{(am)} \sqrt{\bar{n}_a} \qquad g_{mc} = g_0^{(mc)} \sqrt{\bar{n}_c}$$

These are proportional to the square root of the intracavity photon numbers of the respective pump fields.

**Plain English:** The Hamiltonian is the "rule book" for how energy flows in this system. The first three terms say "each mode has its own energy." The last two terms say "the microwave mode can swap a photon with the mechanical mode, and the mechanical mode can swap a phonon with the optical mode." This two-step swap is how the signal gets converted.

### Lindblad Master Equation

The system is open: each mode couples to its own thermal bath. The density matrix evolves according to:

$$\frac{d\rho}{dt} = -\frac{i}{\hbar}[\hat{H}_{\text{int}}, \rho] + \sum_k \mathcal{D}[\hat{L}_k]\rho$$

where the Lindblad dissipator is:

$$\mathcal{D}[\hat{L}]\rho = \hat{L}\rho\hat{L}^\dagger - \frac{1}{2}\left(\hat{L}^\dagger\hat{L}\rho + \rho\hat{L}^\dagger\hat{L}\right)$$

The collapse operators encode both energy loss and thermal noise:

$$\hat{L}_1 = \sqrt{\kappa_a}\;\hat{a} \quad \text{(microwave photon emission)}$$

$$\hat{L}_2 = \sqrt{\gamma_b(1 + \bar{n}_{\text{th}})}\;\hat{b} \quad \text{(phonon emission: spontaneous + stimulated)}$$

$$\hat{L}_3 = \sqrt{\gamma_b \bar{n}_{\text{th}}}\;\hat{b}^\dagger \quad \text{(thermal phonon absorption from bath)}$$

$$\hat{L}_4 = \sqrt{\kappa_c}\;\hat{c} \quad \text{(optical photon emission)}$$

The thermal occupation of the mechanical bath follows the Bose-Einstein distribution:

$$\bar{n}_{\text{th}} = \left[\exp\left(\frac{\hbar\omega_b}{k_B T}\right) - 1\right]^{-1}$$

Even at 15 mK, a 5 GHz mechanical mode has a small residual occupation of approximately 0.01 phonons, but laser-induced heating can raise the effective bath temperature dramatically [5].

**Plain English:** In the real world, quantum systems are not isolated — they leak energy. The master equation accounts for this by adding "collapse operators" that describe photons escaping the cavities and thermal vibrations entering the mechanical mode from the warm environment. This is what makes the simulation realistic rather than idealized.

### Monte Carlo Quantum Trajectories

As an alternative to the master equation, the Monte Carlo wavefunction method (MCWF) simulates individual quantum trajectories. Between stochastic collapse events, the system evolves under a non-Hermitian effective Hamiltonian:

$$\hat{H}_{\text{eff}} = \hat{H}_{\text{int}} - \frac{i\hbar}{2}\sum_k \hat{L}_k^\dagger \hat{L}_k$$

At each timestep, a random number determines whether a quantum jump occurs. Over many trajectories, the ensemble average converges to the master equation solution. A single trajectory reveals the discrete, stochastic nature of quantum measurement — the photon "jumps" between modes [6].

**Plain English:** Instead of tracking a smooth probability distribution, this method simulates one possible "reality" at a time. At each moment, the simulator rolls a die to decide: "Does a photon escape right now?" This produces jagged, noisy traces — exactly what a real detector would see if you watched one photon at a time. Average enough of these random histories together, and you recover the smooth master equation result.

### Key Metrics

**Conversion Efficiency (η):**

$$\eta = \frac{\max_t \langle \hat{c}^\dagger\hat{c} \rangle(t)}{\langle \hat{a}^\dagger\hat{a} \rangle(0)}$$

*"What fraction of the input microwave photon ends up as an optical photon at the best possible moment?"*

**Quantum State Fidelity (F):**

$$\mathcal{F} = \langle 1_c | \hat{\rho}_c(t_{\text{peak}}) | 1_c \rangle$$

*"At the moment of peak transfer, how close is the optical output to a perfect single-photon state?"* A fidelity of 1.0 means perfect quantum information transfer. Anything below ~0.5 means the quantum advantage is lost.

**Added Noise Quanta (n_add):**

$$n_{\text{add}} = \max_t \langle \hat{c}^\dagger\hat{c} \rangle_{\text{vacuum input}}$$

*"If I send nothing into the transducer, how many fake photons come out anyway?"* This is measured by running the simulation with vacuum (zero photons) at the input. Any output photons are pure noise from thermal phonons leaking through the conversion chain. For quantum applications, this must be well below 1.

### Wigner Quasi-Probability Distribution

The Wigner function provides a complete phase-space representation of the quantum state:

$$W(\alpha) = \frac{2}{\pi} \text{Tr}\left[\hat{D}^\dagger(\alpha)\hat{\rho}\hat{D}(\alpha)(-1)^{\hat{n}}\right]$$

For a classical state (coherent, thermal), the Wigner function is non-negative everywhere. **Negative values of the Wigner function are a definitive signature of non-classicality** — they indicate the quantum nature of the transduced state has been preserved through the conversion [7].

**Plain English:** The Wigner function is a way to "photograph" a quantum state. Classical states (like laser light) always produce a smooth, positive photograph. But true quantum states (like a single photon) produce photographs with *negative regions* — something impossible in classical physics. When our heatmap shows purple (negative) regions, it proves the transducer is preserving the quantum nature of the signal. If the heatmap is all positive (orange/yellow), the quantum information has been destroyed by noise.

### Thermal Backaction

The optical pump laser introduces thermal phonons into the mechanical mode. These phonons leak backwards through the electromechanical coupling, inducing an additional decoherence rate on the microwave cavity:

$$\Gamma_{\text{induced}} \approx \frac{g_{am}^2 \bar{n}_{\text{th}}}{\gamma_b / 2}$$

This represents the fundamental tension in transducer design: increasing pump power improves conversion efficiency but degrades qubit coherence [8].

**Plain English:** Here is the cruel paradox of transducer design. You need a strong laser to make the conversion work. But the laser heats the crystal. The hot crystal sends vibrations *backwards* into the qubit's antenna, scrambling the very quantum state you are trying to read. This equation tells you exactly how bad the damage is. It is the reason nobody has built a perfect transducer yet, and it is the central engineering problem this simulator helps you explore.

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

**Plain English:** The app has two halves. The **frontend** (what you see in the browser) is a React dashboard with charts, sliders, and heatmaps. When you drag a slider, it sends a request to the **backend** — a Python server running QuTiP, a professional-grade quantum physics library. The backend solves the actual quantum equations (Schrödinger/Lindblad/Monte Carlo) and sends the results back as JSON. The frontend then plots them. Nothing is hardcoded or faked; every data point comes from a real quantum simulation.

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Physics Engine** | [QuTiP](https://qutip.org) (Python) | Quantum Toolbox — solves master equations, Monte Carlo trajectories, Wigner functions, partial traces |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com) | Serves physics results as JSON over HTTP |
| **Frontend** | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | Interactive dashboard UI |
| **Charts** | [Recharts](https://recharts.org) | Line charts, multi-series plots |
| **Wigner Heatmap** | HTML5 Canvas API | Pixel-level phase-space rendering |
| **Build Tool** | [Vite](https://vite.dev) | Fast dev server with API proxy |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | Utility-first dark-mode design |

---

## Installation and Usage

### Prerequisites

- Python 3.10+ with `pip`
- Node.js 18+ with `npm`

### 1. Clone the Repository

```bash
git clone https://github.com/sovopr/optical-transducers.git
cd optical-transducers
```

### 2. Backend (Physics Engine)

```bash
pip install fastapi uvicorn pydantic qutip numpy

cd backend
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 3. Frontend (Dashboard)

```bash
# From the project root
npm install
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser. The frontend automatically proxies API requests to the backend.

---

## API Reference

### `POST /api/simulate`

Runs a Monte Carlo quantum trajectory simulation and computes quantum metrics via the Lindblad master equation.

**Request Body:**
```json
{
  "gam": 0.5,
  "gmc": 0.5,
  "kappaA": 0.1,
  "gammaB": 0.01,
  "kappaC": 0.1,
  "nThermal": 0.0,
  "ntraj": 1
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `gam` | float | Electromechanical coupling strength (MHz / 2π) |
| `gmc` | float | Optomechanical coupling strength (MHz / 2π) |
| `kappaA` | float | Microwave cavity decay rate (MHz / 2π) |
| `gammaB` | float | Mechanical resonator decay rate (MHz / 2π) |
| `kappaC` | float | Optical cavity decay rate (MHz / 2π) |
| `nThermal` | float | Thermal phonon occupation number |
| `ntraj` | int | Number of Monte Carlo trajectories |

**Response:**
```json
{
  "data": [
    {"time": 0.0, "microwave": 1.0, "mechanical": 0.0, "optical": 0.0},
    {"time": 0.05, "microwave": 0.97, "mechanical": 0.02, "optical": 0.01}
  ],
  "metrics": {
    "fidelity": 0.8734,
    "addedNoise": 0.0012,
    "maxEfficiency": 0.8912,
    "peakTime": 4.724
  }
}
```

---

### `POST /api/wigner`

Computes the Wigner quasi-probability distribution of the optical cavity's reduced density matrix.

**Request Body:**
```json
{
  "gam": 0.5,
  "gmc": 0.5,
  "kappaA": 0.1,
  "gammaB": 0.01,
  "kappaC": 0.1,
  "nThermal": 0.0,
  "timeIndex": null
}
```

**Response:**
```json
{
  "xvec": [-3.0, -2.925, "..."],
  "W": [["2D array of Wigner values"]],
  "time": 4.724,
  "wMin": -0.031,
  "wMax": 0.124
}
```

If `timeIndex` is null, the Wigner function is computed at the time of peak optical population. If specified, it is computed at that specific timestep index.

---

### `POST /api/sweep`

Runs a parametric sweep of the optomechanical coupling strength, computing efficiency, fidelity, and added noise at each point.

**Request Body:**
```json
{
  "gam": 0.5,
  "kappaA": 0.1,
  "gammaB": 0.01,
  "kappaC": 0.1,
  "nThermal": 0.0,
  "gmcMin": 0.05,
  "gmcMax": 2.0,
  "gmcSteps": 20
}
```

**Response:**
```json
{
  "data": [
    {"gmc": 0.05, "efficiency": 0.12, "fidelity": 0.11, "addedNoise": 0.0},
    {"gmc": 0.15, "efficiency": 0.34, "fidelity": 0.31, "addedNoise": 0.001}
  ]
}
```

---

### `POST /api/backaction`

Simulates transducer performance degradation across a range of thermal phonon occupations.

**Request Body:**
```json
{
  "gam": 0.5,
  "gmc": 0.5,
  "kappaA": 0.1,
  "gammaB": 0.01,
  "kappaC": 0.1,
  "nThermalMin": 0.0,
  "nThermalMax": 50.0,
  "nThermalSteps": 15
}
```

**Response:**
```json
{
  "data": [
    {"nThermal": 0.0, "efficiency": 0.89, "fidelity": 0.87, "addedNoise": 0.0, "inducedDecoherence": 0.0},
    {"nThermal": 3.57, "efficiency": 0.72, "fidelity": 0.63, "addedNoise": 0.45, "inducedDecoherence": 11.2}
  ]
}
```

---

## Project Structure

```
optical-transducers/
├── backend/
│   └── main.py                  # FastAPI server + QuTiP physics engine
├── src/
│   ├── App.tsx                  # Main dashboard shell with tab navigation
│   ├── index.css                # Global styles and Tailwind configuration
│   └── components/
│       ├── PhysicsSim.tsx       # Tab 1: Monte Carlo trajectories + Wigner heatmap + metrics
│       ├── EfficiencySweep.tsx   # Tab 2: Parametric g_mc sweep
│       ├── Backaction.tsx        # Tab 3: Thermal backaction analysis
│       └── Architecture.tsx     # Tab 4: Dilution refrigerator schematic
├── vite.config.ts               # Vite config with API proxy to backend
├── tailwind.config.js           # Custom color tokens (quantum-bg, quantum-card, etc.)
├── package.json
├── tsconfig.json
└── README.md
```

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
