// src/graphics/lightingSystem.js - Volumetric Lighting System

class VolumetricLighting {
    constructor(canvas) {
        this.canvas = canvas;
        this.causticCanvas = document.createElement('canvas');
        this.causticCtx = this.causticCanvas.getContext('2d');
        this.lightRays = [];
        this.causticPatterns = [];
        this.godRayCanvas = document.createElement('canvas');
        this.godRayCtx = this.godRayCanvas.getContext('2d');
        
        this.setupCanvases();
        this.initializeCaustics();
        this.initializeGodRays();
    }

    setupCanvases() {
        // Setup caustic canvas
        this.causticCanvas.width = this.canvas.width;
        this.causticCanvas.height = 200; // Height for caustic effect area
        
        // Setup god ray canvas
        this.godRayCanvas.width = this.canvas.width;
        this.godRayCanvas.height = this.canvas.height;
    }

    initializeCaustics() {
        // Pre-generate caustic patterns for smooth animation
        for (let i = 0; i < 8; i++) {
            this.causticPatterns.push(this.generateCausticPattern(i));
        }
    }

    initializeGodRays() {
        // Initialize god ray properties
        const rayCount = 6;
        for (let i = 0; i < rayCount; i++) {
            this.lightRays.push({
                x: (i + 0.5) * (this.canvas.width / rayCount),
                width: 60 + Math.random() * 40,
                intensity: 0.3 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.3
            });
        }
    }

    generateCausticPattern(index) {
        // Create off-screen canvas for caustic pattern
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = this.canvas.width;
        patternCanvas.height = 200;
        const ctx = patternCanvas.getContext('2d');

        // Create caustic-like patterns using overlapping circles and waves
        const numWaves = 15 + index * 3;
        const baseHue = 190 + index * 5; // Blue-cyan range

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.6;

        for (let i = 0; i < numWaves; i++) {
            const x = (i / numWaves) * patternCanvas.width;
            const amplitude = 30 + Math.sin(i * 0.5 + index) * 20;
            const frequency = 0.01 + index * 0.002;
            
            // Create wave-like caustic lines
            ctx.strokeStyle = `hsla(${baseHue}, 70%, 60%, 0.3)`;
            ctx.lineWidth = 2 + Math.sin(i + index) * 2;
            
            ctx.beginPath();
            for (let x2 = 0; x2 < patternCanvas.width; x2 += 2) {
                const y = 100 + Math.sin(x2 * frequency + i) * amplitude + 
                         Math.sin(x2 * frequency * 2 + i + index) * amplitude * 0.5;
                if (x2 === 0) {
                    ctx.moveTo(x2, y);
                } else {
                    ctx.lineTo(x2, y);
                }
            }
            ctx.stroke();
        }

        // Add caustic focus points (brighter spots)
        const focusPoints = 8 + index * 2;
        for (let i = 0; i < focusPoints; i++) {
            const x = (i / focusPoints) * patternCanvas.width + Math.sin(index + i) * 50;
            const y = 60 + Math.sin(i * 0.8 + index) * 40;
            const radius = 15 + Math.sin(i + index) * 10;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `hsla(${baseHue}, 80%, 70%, 0.6)`);
            gradient.addColorStop(0.5, `hsla(${baseHue}, 60%, 50%, 0.3)`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        return patternCanvas;
    }

    renderVolumetricLighting(ctx, time) {
        ctx.save();
        
        // Set blend mode for lighting effects
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.4;
        
        // Render god rays from surface
        this.renderGodRays(ctx, time);
        
        // Render caustics on the sea floor
        this.renderCaustics(ctx, time);
        
        // Add atmospheric particles floating in the water
        this.renderLightParticles(ctx, time);
        
        // Add subtle ambient light gradient
        this.renderAmbientGradient(ctx, time);
        
        ctx.restore();
    }

    renderGodRays(ctx, time) {
        // Clear god ray canvas
        this.godRayCtx.clearRect(0, 0, this.godRayCanvas.width, this.godRayCanvas.height);
        
        for (const ray of this.lightRays) {
            const animatedX = ray.x + Math.sin(time * 0.001 * ray.speed + ray.phase) * 30;
            const animatedIntensity = ray.intensity * (0.7 + Math.sin(time * 0.002 + ray.phase) * 0.3);
            
            // Create gradient for god ray
            const gradient = this.godRayCtx.createLinearGradient(
                animatedX, 0, 
                animatedX, this.canvas.height
            );
            
            const lightColor = `rgba(135, 206, 235, ${animatedIntensity})`;
            const midColor = `rgba(135, 206, 235, ${animatedIntensity * 0.6})`;
            const endColor = `rgba(135, 206, 235, 0)`;
            
            gradient.addColorStop(0, lightColor);
            gradient.addColorStop(0.3, midColor);
            gradient.addColorStop(0.7, `rgba(135, 206, 235, ${animatedIntensity * 0.3})`);
            gradient.addColorStop(1, endColor);
            
            this.godRayCtx.fillStyle = gradient;
            
            // Draw tapered ray shape
            this.godRayCtx.beginPath();
            this.godRayCtx.moveTo(animatedX - ray.width * 0.2, 0);
            this.godRayCtx.lineTo(animatedX + ray.width * 0.2, 0);
            this.godRayCtx.lineTo(animatedX + ray.width * 0.5, this.canvas.height);
            this.godRayCtx.lineTo(animatedX - ray.width * 0.5, this.canvas.height);
            this.godRayCtx.closePath();
            this.godRayCtx.fill();
        }
        
        // Draw the god rays onto the main canvas
        ctx.globalAlpha = 0.3;
        ctx.drawImage(this.godRayCanvas, 0, 0);
    }

    renderCaustics(ctx, time) {
        // Calculate which caustic patterns to blend between
        const patternIndex = Math.floor(time * 0.001) % this.causticPatterns.length;
        const nextPatternIndex = (patternIndex + 1) % this.causticPatterns.length;
        const blendFactor = (time * 0.001) % 1;
        
        const currentPattern = this.causticPatterns[patternIndex];
        const nextPattern = this.causticPatterns[nextPatternIndex];
        
        // Position caustics at the bottom of the screen
        const causticY = this.canvas.height - 200;
        
        // Render current pattern
        ctx.globalAlpha = 0.3 * (1 - blendFactor);
        ctx.drawImage(currentPattern, 0, causticY);
        
        // Blend with next pattern
        ctx.globalAlpha = 0.3 * blendFactor;
        ctx.drawImage(nextPattern, 0, causticY);
        
        // Add moving caustic highlights
        this.renderMovingCaustics(ctx, time, causticY);
    }

    renderMovingCaustics(ctx, time, baseY) {
        const numCaustics = 12;
        
        for (let i = 0; i < numCaustics; i++) {
            const x = ((time * 0.02 * (1 + i * 0.1)) % (this.canvas.width + 100)) - 50;
            const y = baseY + 50 + Math.sin(time * 0.003 + i) * 30;
            const size = 20 + Math.sin(time * 0.004 + i * 0.5) * 15;
            const intensity = 0.4 + Math.sin(time * 0.005 + i) * 0.3;
            
            // Create caustic spot
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(135, 206, 250, ${intensity})`);
            gradient.addColorStop(0.5, `rgba(135, 206, 250, ${intensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(135, 206, 250, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderLightParticles(ctx, time) {
        const particleCount = 25;
        
        for (let i = 0; i < particleCount; i++) {
            const x = ((time * 0.01 * (0.5 + i * 0.05)) % (this.canvas.width + 20)) - 10;
            const y = 50 + (i / particleCount) * (this.canvas.height - 100) + 
                     Math.sin(time * 0.002 + i * 0.1) * 40;
            
            const size = 1 + Math.sin(time * 0.008 + i) * 1;
            const opacity = 0.3 + Math.sin(time * 0.006 + i * 0.3) * 0.2;
            
            ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add subtle glow
            ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderAmbientGradient(ctx, time) {
        // Create depth-based ambient lighting gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Surface lighting (brighter)
        gradient.addColorStop(0, `rgba(135, 206, 250, 0.2)`);
        // Mid-water transition
        gradient.addColorStop(0.3, `rgba(100, 149, 237, 0.1)`);
        // Deep water (darker)
        gradient.addColorStop(0.7, `rgba(70, 130, 180, 0.05)`);
        // Sea floor (darkest)
        gradient.addColorStop(1, `rgba(25, 25, 112, 0.02)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle pulsing ambient light
        const pulseIntensity = 0.05 + Math.sin(time * 0.001) * 0.02;
        ctx.fillStyle = `rgba(135, 206, 250, ${pulseIntensity})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Method to enhance existing lighting effects
    enhanceEntityLighting(ctx, entity, time) {
        if (!entity || !entity.x || !entity.y) return;

        ctx.save();
        
        // Add subtle rim lighting to entities
        const rimIntensity = 0.1 + Math.sin(time * 0.003) * 0.05;
        const rimColor = `rgba(135, 206, 235, ${rimIntensity})`;
        
        ctx.shadowColor = rimColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = -2;
        
        // This would be applied during entity rendering
        // The entity rendering code would call this method
        
        ctx.restore();
    }

    // Method to add lighting interaction with entities
    addEntityInteraction(ctx, entities, time) {
        for (const entity of entities) {
            if (!entity.x || !entity.y || !entity.size) continue;
            
            // Add localized lighting around larger entities
            if (entity.size > 25) {
                const lightRadius = entity.size * 1.5;
                const lightIntensity = 0.05 + Math.sin(time * 0.004) * 0.02;
                
                const gradient = ctx.createRadialGradient(
                    entity.x, entity.y, 0,
                    entity.x, entity.y, lightRadius
                );
                
                gradient.addColorStop(0, `rgba(200, 220, 255, ${lightIntensity})`);
                gradient.addColorStop(0.5, `rgba(200, 220, 255, ${lightIntensity * 0.5})`);
                gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(entity.x, entity.y, lightRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Handle canvas resize
    onResize(newWidth, newHeight) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.setupCanvases();
        this.initializeGodRays(); // Reinitialize god rays for new canvas size
    }
}

export default VolumetricLighting;