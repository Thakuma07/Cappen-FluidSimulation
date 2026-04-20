# Cappen Fluid Simulation

A high-performance, visually stunning fluid simulation built with **Three.js** and **WebGL**, migrated to a modern **Vite** build system.

![Fluid Simulation Preview](https://img.shields.io/badge/WebGL-Simulation-blue?style=for-the-badge&logo=opengl)
![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=for-the-badge&logo=three.dot-js)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

- **Real-time Fluid Dynamics**: Navier-Stokes based simulation running entirely on the GPU.
- **Interactive Splats**: Reactive fluid interaction based on mouse or touch input.
- **Vorticity Confinement**: Restores small-scale swirling details for a more realistic look.
- **Modern Build System**: Powered by Vite for lightning-fast development and optimized production builds.
- **GLSL Modularization**: Shaders are moved to dedicated `.glsl` files for better maintainability and syntax highlighting.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Thakuma07/Cappen-FluidSimulation.git
   cd Cappen-FluidSimulation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Project Structure

```text
├── js/
│   ├── Shaders/          # GLSL Shader source files
│   │   ├── base.vert     # Common vertex shader
│   │   ├── splat.frag    # Interaction force shader
│   │   └── ...           # Physics & Display shaders
│   ├── FluidSimulation.js # Core simulation engine
│   └── script.js         # Entry point and configuration
├── css/                  # Styling
├── index.html            # Main entry point
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## ⚙️ Configuration

You can customize the simulation behavior in `js/script.js`:

```javascript
const config = {
  simResolution: 256,        // Internal simulation grid size
  dyeResolution: 1024,       // Visual resolution for the color
  curl: 25,                  // Vorticity strength (swirliness)
  pressureIterations: 50,    // Accuracy of the pressure solver
  velocityDissipation: 0.95, // How fast the fluid stops moving
  dyeDissipation: 0.95,      // How fast the color fades
  splatRadius: 0.275,        // Size of the input interaction
  forceStrength: 7.5,        // Strength of the mouse pull
  inkColor: new THREE.Color(1, 1, 1), // Color of the fluid
};
```

## 📜 License

This project is open-source. Feel free to use and modify it for your own projects!

---

Developed with ❤️ by [thakuma.dev](https://thakuma.dev)
