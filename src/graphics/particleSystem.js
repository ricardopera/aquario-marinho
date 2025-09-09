// src/graphics/particleSystem.js - Advanced Particle System

class AdvancedParticleSystem {
    constructor() {
        this.particles = [];
        this.emitters = new Map();
        this.maxParticles = 500; // Performance limit
        
        this.particleTypes = {
            'feeding': this.createFeedingParticle.bind(this),
            'blood': this.createBloodParticle.bind(this),
            'bubbles': this.createBubbleParticle.bind(this),
            'scales': this.createScaleParticle.bind(this),
            'sediment': this.createSedimentParticle.bind(this),
            'explosion': this.createExplosionParticle.bind(this),
            'sparkle': this.createSparkleParticle.bind(this)
        };
    }

    // Create a particle emitter
    createEmitter(type, position, config = {}) {
        const emitter = new ParticleEmitter(type, position, config);
        const id = Math.random().toString(36);
        this.emitters.set(id, emitter);
        return id;
    }

    // Remove a particle emitter
    removeEmitter(id) {
        this.emitters.delete(id);
    }

    // Feeding effect when fish eat
    createFeedingEffect(position, intensity = 1) {
        const particleCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 1 + Math.random() * 3;
            
            const particle = {
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: this.getRandomFoodColor(),
                life: 1.0,
                decay: 0.02,
                type: 'feeding',
                gravity: 0.1,
                bounce: 0.3
            };
            
            this.addParticle(particle);
        }
    }

    // Attack/collision effect when predator strikes
    createAttackEffect(position, intensity = 1) {
        const particleCount = Math.floor(12 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            
            const particle = {
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                color: Math.random() < 0.7 ? '#ff6b6b' : '#4ecdc4',
                life: 1.0,
                decay: 0.015,
                type: 'blood',
                gravity: 0.05
            };
            
            this.addParticle(particle);
        }
    }

    // Bubble trail effect when fish swim fast
    createBubbleTrail(position, velocity, intensity = 0.5) {
        if (Math.random() < intensity) {
            const particle = {
                x: position.x + (Math.random() - 0.5) * 20,
                y: position.y + (Math.random() - 0.5) * 10,
                vx: velocity.x * 0.1 + (Math.random() - 0.5),
                vy: velocity.y * 0.1 - Math.random() * 2, // Bubbles rise
                size: 1 + Math.random() * 3,
                color: 'rgba(255, 255, 255, 0.6)',
                life: 1.0,
                decay: 0.01,
                type: 'bubbles',
                gravity: -0.2, // Negative gravity for rising bubbles
                wobble: Math.random() * 0.1
            };
            
            this.addParticle(particle);
        }
    }

    // Scale particles when fish are damaged or stressed
    createScaleEffect(position, fishColor, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            
            const particle = {
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2,
                color: this.lightenColor(fishColor, 0.3),
                life: 1.0,
                decay: 0.008,
                type: 'scales',
                gravity: 0.15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            };
            
            this.addParticle(particle);
        }
    }

    // Sediment particles when fish move near the bottom
    createSedimentCloud(position, disturbance = 1) {
        const particleCount = Math.floor(6 * disturbance);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI - Math.PI/2; // Spread upward
            const speed = 0.5 + Math.random() * 1.5;
            
            const particle = {
                x: position.x + (Math.random() - 0.5) * 30,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                color: this.getSedimentColor(),
                life: 1.0,
                decay: 0.005,
                type: 'sediment',
                gravity: 0.1
            };
            
            this.addParticle(particle);
        }
    }

    // Explosion effect for dramatic moments
    createExplosionEffect(position, radius = 30, intensity = 1) {
        const particleCount = Math.floor(20 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = (2 + Math.random() * 4) * intensity;
            const distance = Math.random() * radius;
            
            const startX = position.x + Math.cos(angle) * distance;
            const startY = position.y + Math.sin(angle) * distance;
            
            const particle = {
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: this.getExplosionColor(),
                life: 1.0,
                decay: 0.02,
                type: 'explosion',
                gravity: 0.05,
                shrink: true
            };
            
            this.addParticle(particle);
        }
    }

    // Sparkle effect for magical or special moments
    createSparkleEffect(position, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            
            const particle = {
                x: position.x + (Math.random() - 0.5) * 20,
                y: position.y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                color: this.getSparkleColor(),
                life: 1.0,
                decay: 0.025,
                type: 'sparkle',
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.2
            };
            
            this.addParticle(particle);
        }
    }

    // Add a particle to the system
    addParticle(particle) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(particle);
        }
    }

    // Update all particles
    update() {
        // Update emitters
        for (const emitter of this.emitters.values()) {
            emitter.update();
            if (emitter.shouldEmit()) {
                const newParticles = emitter.emit();
                newParticles.forEach(p => this.addParticle(p));
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            this.updateParticle(particle);
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateParticle(particle) {
        // Apply gravity
        if (particle.gravity) {
            particle.vy += particle.gravity;
        }

        // Apply wobble effect for bubbles
        if (particle.wobble) {
            particle.vx += Math.sin(Date.now() * 0.01 + particle.x * 0.1) * particle.wobble;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Apply rotation
        if (particle.rotationSpeed) {
            particle.rotation += particle.rotationSpeed;
        }

        // Apply twinkle effect
        if (particle.twinkle !== undefined) {
            particle.twinkle += particle.twinkleSpeed || 0.1;
        }

        // Shrink particles if specified
        if (particle.shrink) {
            particle.size *= 0.98;
        }

        // Apply bouncing for certain particles
        if (particle.bounce && particle.y > window.innerHeight - 50) {
            particle.vy *= -particle.bounce;
            particle.y = window.innerHeight - 50;
        }

        // Reduce life
        particle.life -= particle.decay;
    }

    // Render all particles
    render(ctx) {
        ctx.save();
        
        for (const particle of this.particles) {
            this.renderParticle(ctx, particle);
        }
        
        ctx.restore();
    }

    renderParticle(ctx, particle) {
        const alpha = particle.life;
        
        ctx.save();
        ctx.translate(particle.x, particle.y);
        
        if (particle.rotation) {
            ctx.rotate(particle.rotation);
        }

        // Handle twinkle effect
        let size = particle.size;
        if (particle.twinkle !== undefined) {
            size *= 0.5 + Math.sin(particle.twinkle) * 0.5;
        }

        // Set particle color with alpha
        const color = particle.color;
        if (color.includes('rgba')) {
            // Replace alpha in rgba color
            const newColor = color.replace(/[\d\.]+\)$/g, `${alpha})`);
            ctx.fillStyle = newColor;
        } else if (color.includes('hsla')) {
            // Replace alpha in hsla color
            const newColor = color.replace(/[\d\.]+\)$/g, `${alpha})`);
            ctx.fillStyle = newColor;
        } else {
            // Add alpha to solid colors
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
        }

        // Draw particle based on type
        switch (particle.type) {
            case 'feeding':
                this.drawFoodParticle(ctx, size);
                break;
            case 'blood':
                this.drawBloodParticle(ctx, size);
                break;
            case 'bubbles':
                this.drawBubbleParticle(ctx, size);
                break;
            case 'scales':
                this.drawScaleParticle(ctx, size);
                break;
            case 'sediment':
                this.drawSedimentParticle(ctx, size);
                break;
            case 'explosion':
                this.drawExplosionParticle(ctx, size);
                break;
            case 'sparkle':
                this.drawSparkleParticle(ctx, size);
                break;
            default:
                this.drawDefaultParticle(ctx, size);
        }

        ctx.restore();
    }

    // Particle drawing methods
    drawFoodParticle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBloodParticle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBubbleParticle(ctx, size) {
        // Draw bubble with transparent center
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawScaleParticle(ctx, size) {
        // Draw scale as small ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSedimentParticle(ctx, size) {
        // Draw irregular sediment particle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawExplosionParticle(ctx, size) {
        // Draw star-like explosion particle
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    drawSparkleParticle(ctx, size) {
        // Draw diamond/star sparkle
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.3, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
    }

    drawDefaultParticle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Color generation methods
    getRandomFoodColor() {
        const colors = [
            'hsl(30, 70%, 60%)',  // Orange
            'hsl(60, 70%, 60%)',  // Yellow
            'hsl(120, 70%, 60%)', // Green
            'hsl(0, 70%, 60%)'    // Red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getSedimentColor() {
        const hue = 30 + Math.random() * 30; // Brown/tan range
        const sat = 40 + Math.random() * 20;
        const light = 30 + Math.random() * 20;
        return `hsl(${hue}, ${sat}%, ${light}%)`;
    }

    getExplosionColor() {
        const colors = ['#ff6b6b', '#ffa726', '#ffeb3b', '#ff9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getSparkleColor() {
        const colors = ['#ffffff', '#f0f8ff', '#e0e6ff', '#ffd700'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    lightenColor(color, amount) {
        // Simple color lightening (works with hex colors)
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            const r = Math.min(255, (num >> 16) + amount * 255);
            const g = Math.min(255, (num >> 8 & 0x00FF) + amount * 255);
            const b = Math.min(255, (num & 0x0000FF) + amount * 255);
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        return color;
    }

    // Particle type creators
    createFeedingParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 2 + Math.random() * 3,
            color: this.getRandomFoodColor(),
            life: 1.0,
            decay: 0.02,
            type: 'feeding',
            ...config
        };
    }

    createBloodParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 1 + Math.random() * 2,
            color: '#ff6b6b',
            life: 1.0,
            decay: 0.015,
            type: 'blood',
            ...config
        };
    }

    createBubbleParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3,
            size: 2 + Math.random() * 4,
            color: 'rgba(255, 255, 255, 0.6)',
            life: 1.0,
            decay: 0.01,
            type: 'bubbles',
            gravity: -0.1,
            ...config
        };
    }

    createScaleParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 2 + Math.random() * 2,
            color: '#c0c0c0',
            life: 1.0,
            decay: 0.008,
            type: 'scales',
            gravity: 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            ...config
        };
    }

    createSedimentParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2,
            size: 1 + Math.random() * 2,
            color: this.getSedimentColor(),
            life: 1.0,
            decay: 0.005,
            type: 'sediment',
            gravity: 0.1,
            ...config
        };
    }

    createExplosionParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: 3 + Math.random() * 4,
            color: this.getExplosionColor(),
            life: 1.0,
            decay: 0.02,
            type: 'explosion',
            shrink: true,
            ...config
        };
    }

    createSparkleParticle(x, y, config) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 1 + Math.random() * 2,
            color: this.getSparkleColor(),
            life: 1.0,
            decay: 0.025,
            type: 'sparkle',
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.2,
            ...config
        };
    }

    // Get particle count for performance monitoring
    getParticleCount() {
        return this.particles.length;
    }

    // Clear all particles
    clear() {
        this.particles = [];
        this.emitters.clear();
    }
}

// Particle Emitter class
class ParticleEmitter {
    constructor(type, position, config = {}) {
        this.type = type;
        this.position = { ...position };
        this.emissionRate = config.emissionRate || 10; // particles per second
        this.duration = config.duration || -1; // -1 for infinite
        this.particleConfig = config.particleConfig || {};
        
        this.lastEmission = 0;
        this.startTime = Date.now();
        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        // Check if emitter should expire
        if (this.duration > 0 && Date.now() - this.startTime > this.duration * 1000) {
            this.active = false;
            return;
        }
    }

    shouldEmit() {
        if (!this.active) return false;
        
        const now = Date.now();
        const timeSinceLastEmission = now - this.lastEmission;
        const emissionInterval = 1000 / this.emissionRate;
        
        return timeSinceLastEmission >= emissionInterval;
    }

    emit() {
        this.lastEmission = Date.now();
        
        // Create and return new particles
        const particles = [];
        const particleCount = 1; // One particle per emission
        
        for (let i = 0; i < particleCount; i++) {
            // This would need to use the particle system's creation methods
            // For now, return a basic particle
            particles.push({
                x: this.position.x,
                y: this.position.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 2 + Math.random() * 2,
                color: '#ffffff',
                life: 1.0,
                decay: 0.02,
                type: this.type,
                ...this.particleConfig
            });
        }
        
        return particles;
    }
}

export default AdvancedParticleSystem;