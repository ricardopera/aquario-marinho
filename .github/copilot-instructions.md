# Aquário Marinho (Marine Aquarium) - Developer Instructions

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Project Overview

Aquário Marinho is an interactive marine aquarium simulation built with HTML5 Canvas and vanilla JavaScript ES6+ modules. The application features AI-driven fish behaviors, predator-prey interactions, thought bubbles, and a complete marine ecosystem with 15+ different fish species, corals, jellyfish, and environmental elements.

## Working Effectively

### Bootstrap and Run the Application
- **NEVER** try to build the code - this is a client-side only application with no build process
- **Server Setup**: `python3 -m http.server 8080` - starts instantly (< 1 second)
- **Access URL**: http://localhost:8080
- **NEVER CANCEL**: The application loads and runs immediately - no timeouts needed

### Development Environment
- **No Dependencies**: No package.json or npm dependencies - uses pure ES6 modules
- **No Build Process**: Direct file serving - changes are immediately visible on refresh
- **Browser Requirements**: Any modern browser (Chrome, Firefox, Edge, Safari)
- **Development Tools**: Browser DevTools for debugging

### Project Structure
```
src/
├── main.js                 # Entry point - initializes aquarium and manages game loop
├── entities/               # All aquarium entities
│   ├── fish.js            # Main Fish class with AI behaviors
│   ├── coral.js, jellyfish.js, hideout.js, alga.js, bubble.js
│   └── communistFish.js   # Special fish with political quotes
├── behaviors/              # AI behavior system
│   ├── behavior.js        # Base behavior class
│   ├── seekFood.js, flee.js, wander.js, hide.js, schooling.js
├── utils/                 # Utilities and systems
│   ├── collision.js       # Collision detection and particle systems
│   ├── thoughtBubble.js   # Fish thought bubble system
│   ├── vector.js          # Vector mathematics
│   ├── performanceMonitor.js # Performance metrics (F1 to toggle)
│   └── spatialGrid.js     # Optimized collision detection
├── graphics/              # Advanced visual systems
│   ├── fishRenderer.js    # Fish appearance and animation
│   ├── lightingSystem.js  # Volumetric lighting effects
│   └── particleSystem.js  # Advanced particle effects
└── environment.js         # Environment setup utilities
```

## Validation

### Manual Testing Scenarios - ALWAYS RUN THESE AFTER CHANGES

1. **Basic Functionality**: 
   - Load http://localhost:8080 - verify fish swim with thought bubbles
   - Click any fish - verify thought bubble appears showing fish behavior
   - Click empty water - verify bubbles appear and rise

2. **Interactive Controls**:
   - Click "Adicionar Peixe" button - verify new fish appears
   - Click "Adicionar Predador" button - verify predator fish appears
   - Click "Pausar" button - verify animation pauses/resumes
   - Click "🔊" button - verify audio toggles

3. **AI Behaviors**:
   - Watch for predation: predators should chase and eat smaller fish
   - Watch for fleeing: small fish should flee from predators
   - Watch schooling: similar species should group together
   - Watch feeding: fish should move toward corals/algae when hungry

4. **Performance**:
   - Press F1 to toggle performance monitor
   - Add 10+ fish - verify smooth animation (should maintain 60 FPS)
   - Monitor entity count and frame times

### Performance Expectations
- **Startup**: Instantaneous (< 1 second)
- **Frame Rate**: 60 FPS with 15-30 entities
- **Memory**: Stable, no memory leaks during extended runs
- **Response Time**: Interactive controls respond immediately

## Key Development Guidelines

### Entity Management
- All entities inherit from base `Entity` class in `src/entities/entity.js`
- Fish have energy/hunger systems that drive behavior decisions
- **Species Configuration**: Modify `FISH_SPECIES` array in `main.js` to add new fish types
- **Population Control**: Adjust counts via constants: `FISH_COUNT`, `CORAL_COUNT`, etc.

### Behavior System
- Fish behaviors are priority-based: Flee > SeekFood > Hide > Schooling > Wander
- Each behavior returns a steering force vector
- **Adding Behaviors**: Extend base `Behavior` class and register in fish entity

### Collision System
- Uses spatial grid optimization for performance with many entities  
- `CollisionManager` handles all collision detection efficiently
- Particle systems trigger on collisions for visual feedback

### Debugging Tools
- **Performance Monitor**: Press F1 to toggle detailed metrics
- **Console Logs**: Fish thoughts are logged to browser console
- **Browser DevTools**: Use for JavaScript debugging and performance profiling

## Common Tasks

### Adding New Fish Species
1. Add entry to `FISH_SPECIES` array in `main.js`:
   ```javascript
   { name: "New Fish", color: "#FF0000", predator: false, minSize: 15, maxSize: 25 }
   ```
2. Optionally add custom behaviors in `src/behaviors/`
3. Test by clicking "Adicionar Peixe" button

### Modifying Fish Behavior
1. Edit existing behavior files in `src/behaviors/`
2. Adjust behavior weights in `Fish.update()` method
3. Test by observing fish movement patterns and thought bubbles

### Adding Visual Effects
1. Particle effects: Modify `AdvancedParticleSystem` in `src/graphics/particleSystem.js`
2. Lighting effects: Edit `VolumetricLighting` in `src/graphics/lightingSystem.js`  
3. Fish rendering: Modify `FishAppearanceSystem` in `src/graphics/fishRenderer.js`

### Performance Optimization
1. Monitor via F1 performance overlay
2. Adjust entity counts in main.js constants
3. Optimize collision detection in spatial grid system
4. Use particle pooling for effects

## Troubleshooting

### Common Issues
- **Fish not moving**: Check behavior priority system and energy levels
- **Performance drops**: Reduce entity counts or optimize collision detection
- **Missing thought bubbles**: Verify `thoughtBubble.js` system initialization
- **Audio not working**: Check browser autoplay policies

### Browser Compatibility
- **Chrome/Edge**: Full compatibility with all features
- **Firefox**: Full compatibility  
- **Safari**: Full compatibility
- **Mobile**: Responsive but may have performance limitations

## File Locations Reference

### Frequently Modified Files
- `src/main.js` - Entry point, fish counts, species configuration
- `src/entities/fish.js` - Fish AI logic, behavior priorities  
- `src/behaviors/` - Individual behavior implementations
- `style.css` - Visual styling and UI positioning
- `index.html` - HTML structure and UI controls

### Important Constants
```javascript
// In main.js
const FISH_COUNT = 15;        // Initial fish population
const CORAL_COUNT = 8;        // Number of coral formations
const BUBBLE_RATE = 0.1;      // Bubble generation frequency
const FISH_SPECIES = [...];   // Available fish species
```

### Key Classes
- `Fish` - Main entity with AI behaviors
- `Entity` - Base class for all aquarium objects  
- `CollisionManager` - Optimized collision detection
- `PerformanceMonitor` - Real-time performance metrics
- `ThoughtBubbleManager` - Fish thought display system

Remember: This is a pure client-side application. No build tools, no compilation, no package management - just serve the files and they work instantly.