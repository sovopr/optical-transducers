# Piezo-Optomechanical Quantum Transducer Simulator

A full-stack, real-time quantum simulation engine built to model the conversion of microwave photons to optical photons via a mechanical intermediary. This tool allows for both **Master Equation** (average expectations) and **Monte Carlo Trajectory** (individual quantum jumps) simulations of an open quantum system.

---

## 🔬 Physics Overview: The Scaling Bottleneck
Superconducting qubits (like transmons) operate at ~15mK temperatures using 5GHz microwave signals. The grand challenge of scaling quantum computers is that wiring thousands of coaxial cables from 15mK to room temperature introduces insurmountable heat loads.

**The Solution:** A Piezo-Optomechanical Transducer.
1. **Microwave Domain ($\hat{a}$):** The 5GHz signal from the qubit excites a microwave cavity.
2. **Mechanical Bridge ($\hat{b}$):** A piezoelectric material (e.g., Lithium Niobate) converts the microwave photon into a mechanical vibration (phonon).
3. **Optical Domain ($\hat{c}$):** The phonon modulates an optical cavity. A laser pump upconverts this into a 1550nm optical photon that can travel up standard telecommunications fiber, which conducts negligible heat.

---

## 🧮 Mathematical Model

### 1. The System Hamiltonian
We model the three coupled harmonic oscillators in a rotating frame where the bare frequencies ($\omega_a, \omega_b, \omega_c$) are eliminated. The interaction Hamiltonian represents beam-splitter-like exchanges between the adjacent modes:

$$ \hat{H} = \hbar g_{am} (\hat{a}^\dagger \hat{b} + \hat{a} \hat{b}^\dagger) + \hbar g_{mc} (\hat{b}^\dagger \hat{c} + \hat{b} \hat{c}^\dagger) $$

- $\hat{a}, \hat{b}, \hat{c}$: Annihilation operators for the microwave, mechanical, and optical cavities.
- $g_{am}$: Electromechanical coupling strength.
- $g_{mc}$: Optomechanical coupling strength (proportional to laser pump power).

### 2. Environmental Decoherence (Lindblad Master Equation)
Quantum systems are open and lose energy to the environment. We model these decay rates ($\kappa_a, \gamma_b, \kappa_c$) using Lindblad collapse operators. The time evolution of the density matrix $\rho$ is governed by the Master Equation:

$$ \frac{d\rho}{dt} = -i[\hat{H}, \rho] + \kappa_a \mathcal{D}[\hat{a}]\rho + \gamma_b \mathcal{D}[\hat{b}]\rho + \kappa_c \mathcal{D}[\hat{c}]\rho $$

Where the dissipator $\mathcal{D}$ is defined as:
$$ \mathcal{D}[\hat{O}]\rho = \hat{O}\rho\hat{O}^\dagger - \frac{1}{2}\{\hat{O}^\dagger\hat{O}, \rho\} $$

### 3. Monte Carlo Quantum Jumps
To simulate the true, random nature of individual photon jumps, this engine utilizes QuTiP's `mcsolve`. Instead of calculating the smooth average probability distribution (the density matrix), `mcsolve` tracks individual non-Hermitian wavefunctions interspersed with random collapse events, resulting in jagged, discrete quantum trajectories.

---

## 🏗️ System Architecture

This project is structured as a full-stack web application:

1. **Python/FastAPI Backend (`/backend/main.py`)**: 
   - Receives physical parameters from the UI.
   - Reconstructs the Hilbert space and operators using `QuTiP`.
   - Solves the Master Equation or Monte Carlo trajectories dynamically.
2. **React/Vite Frontend (`/src`)**: 
   - An interactive dashboard with sliders to tweak physical parameters in real-time.
   - Includes architectural schematics of the dilution refrigerator.
   - Includes Qubit backaction trade-off analysis modules.

---

## 🚀 How to Run Locally

### 1. Start the Physics Engine (Backend)
```bash
# Install dependencies
pip install fastapi uvicorn pydantic qutip numpy

# Start the server (runs on port 8000)
cd backend
uvicorn main:app --reload
```

### 2. Start the Interactive Dashboard (Frontend)
```bash
# Install dependencies
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 What you will see
- **Single Trajectory (`ntraj = 1`)**: You will see step-functions representing a single microwave photon randomly jumping into the mechanical mode, then to the optical mode, before decaying.
- **Ensemble Average (`ntraj = 100`)**: The jagged jumps will average out into smooth, continuous sine-like waves, proving that the classical probabilities emerge from the statistical aggregate of quantum jumps!
