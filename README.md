# NewGame - Racing & Minecraft Collection

Collection of web-based games with advanced features.

## 🏎️ Racing Game
**Path**: `/racing-game/`

### Features:
- **G29 Steering Wheel Support** with automatic detection
- **Adaptive Controls**: 
  - Wheel: 1.5 sensitivity (more responsive)
  - Keyboard: 0.5 sensitivity (more precise)
- **Large Circuit** with smooth 90° curves
- **Professional Track**: Perfectly aligned kerbs and surfaces
- **Complete Paddock**: 18 garages and club building
- **Realistic Physics**: Bicycle steering model with Ackermann geometry

### Controls:
- **Wheel**: Logitech G29 (auto-detected)
- **Keyboard**: WASD or Arrow Keys

## 🧱 Minecraft Game  
**Path**: `/minecraft-game/`

### Features:
- **AI Builder**: Describe what you want to build
- **Block Building**: Click to remove, AI to create
- **Voice Commands**: "build a house", "create a tower"
- **3D World**: Full Three.js implementation

### Controls:
- **WASD**: Move
- **Mouse**: Look around
- **Click**: Remove blocks
- **T**: Toggle AI Builder

## 🚀 Deployment

### For Vercel:
1. Connect this GitHub repo to Vercel
2. Racing Game will be available at: `your-domain.vercel.app/racing-game/`
3. Minecraft Game will be available at: `your-domain.vercel.app/minecraft-game/`

### Local Development:
```bash
# Serve racing game
cd racing-game && python -m http.server 8000

# Serve minecraft game  
cd minecraft-game && python -m http.server 8001
```

## 🛠️ Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **3D Graphics**: Three.js
- **Input**: Gamepad API (G29), Keyboard Events
- **Physics**: Custom car physics with realistic steering

---
Made with ❤️ and Claude Code
