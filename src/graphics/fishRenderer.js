// src/graphics/fishRenderer.js - Fish Appearance System
import FishAnimator from './fishAnimator.js';

class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    
    next() {
        this.seed = this.seed * 16807 % 2147483647;
        return this.seed;
    }
    
    random() {
        return (this.next() - 1) / 2147483646;
    }
    
    randomInt(max) {
        return Math.floor(this.random() * max);
    }
}

class FishAppearanceSystem {
    constructor() {
        this.patternTemplates = {
            'stripes': this.createStripePattern.bind(this),
            'spots': this.createSpotPattern.bind(this),
            'gradient': this.createGradientPattern.bind(this),
            'solid': this.createSolidPattern.bind(this)
        };
        
        this.bodyShapes = {
            'torpedo': this.drawTorpedoBody.bind(this),
            'disc': this.drawDiscBody.bind(this),
            'elongated': this.drawElongatedBody.bind(this)
        };
        
        // Cache for generated appearances
        this.appearanceCache = new Map();
        
        // Initialize the fish animator
        this.animator = new FishAnimator();
    }

    generateFishAppearance(species, seed) {
        // Check cache first
        const cacheKey = `${species}-${seed}`;
        if (this.appearanceCache.has(cacheKey)) {
            return this.appearanceCache.get(cacheKey);
        }
        
        // Use seed for deterministic results
        const rng = new SeededRandom(seed);
        
        // Define species-specific traits
        const speciesTraits = this.getSpeciesTraits(species);
        
        const appearance = {
            bodyShape: speciesTraits.bodyShapes[rng.randomInt(speciesTraits.bodyShapes.length)],
            pattern: speciesTraits.patterns[rng.randomInt(speciesTraits.patterns.length)],
            primaryColor: this.generateColorVariation(speciesTraits.baseColor, rng, 0.3),
            secondaryColor: this.generateColorVariation(speciesTraits.baseColor, rng, 0.5),
            size: speciesTraits.baseSize * (0.8 + rng.random() * 0.4), // ±20% size variation
            finStyle: speciesTraits.finStyles[rng.randomInt(speciesTraits.finStyles.length)],
            eyeStyle: speciesTraits.eyeStyles[rng.randomInt(speciesTraits.eyeStyles.length)]
        };
        
        // Cache the result
        this.appearanceCache.set(cacheKey, appearance);
        return appearance;
    }

    getSpeciesTraits(species) {
        const traits = {
            'common': {
                bodyShapes: ['torpedo', 'elongated'],
                patterns: ['stripes', 'solid', 'gradient'],
                baseColor: '#4CAF50',
                baseSize: 20,
                finStyles: ['normal', 'long'],
                eyeStyles: ['round', 'large']
            },
            'predator': {
                bodyShapes: ['torpedo', 'disc'],
                patterns: ['spots', 'solid'],
                baseColor: '#f44336',
                baseSize: 35,
                finStyles: ['sharp', 'normal'],
                eyeStyles: ['sharp', 'round']
            },
            'tropical': {
                bodyShapes: ['disc', 'elongated'],
                patterns: ['stripes', 'spots', 'gradient'],
                baseColor: '#FF9800',
                baseSize: 25,
                finStyles: ['colorful', 'long'],
                eyeStyles: ['large', 'round']
            }
        };
        
        return traits[species] || traits['common'];
    }

    generateColorVariation(baseColor, rng, variation) {
        // Convert hex to HSL for better color manipulation
        const hsl = this.hexToHsl(baseColor);
        
        // Vary hue, saturation, and lightness
        hsl.h = (hsl.h + (rng.random() - 0.5) * variation * 360) % 360;
        if (hsl.h < 0) hsl.h += 360;
        
        hsl.s = Math.max(0, Math.min(1, hsl.s + (rng.random() - 0.5) * variation));
        hsl.l = Math.max(0.2, Math.min(0.8, hsl.l + (rng.random() - 0.5) * variation * 0.5));
        
        return this.hslToHex(hsl);
    }

    renderFish(ctx, fish) {
        if (!fish.appearance) {
            // Generate appearance if not already done
            const seed = fish.id ? fish.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.random() * 1000;
            fish.appearance = this.generateFishAppearance(fish.species, seed);
        }

        // Update fish animations before rendering
        this.animator.updateFishAnimations(fish, 16); // Assuming 60 FPS (16ms per frame)

        ctx.save();
        
        // Apply fish transformations
        ctx.translate(fish.x, fish.y);
        ctx.rotate(fish.direction);
        
        // Apply banking/tilting if fish is turning
        if (fish.bankAngle) {
            ctx.rotate(fish.bankAngle * 0.3); // Subtle banking effect
        }
        
        // Apply breathing scale
        const breathingScale = fish.breathingScale || 1;
        ctx.scale((fish.appearance.size / 20) * breathingScale, breathingScale);
        
        // Draw body with pattern and undulation
        this.drawBodyWithPattern(ctx, fish);
        
        // Draw enhanced animated fins
        this.drawEnhancedAnimatedFins(ctx, fish);
        
        // Draw expressive eyes with animation
        this.drawAnimatedExpressiveEyes(ctx, fish);
        
        // Draw state effects (hunger, fear, etc.)
        this.drawStateEffects(ctx, fish);
        
        ctx.restore();
    }

    drawBodyWithPattern(ctx, fish) {
        const pattern = fish.appearance.pattern;
        const shape = fish.appearance.bodyShape;
        
        // Create body mask
        ctx.save();
        this.bodyShapes[shape](ctx, fish);
        ctx.clip();
        
        // Apply pattern
        this.patternTemplates[pattern](ctx, fish);
        
        ctx.restore();
        
        // Draw body outline
        ctx.strokeStyle = this.darkenColor(fish.appearance.primaryColor, 0.3);
        ctx.lineWidth = 1;
        this.bodyShapes[shape](ctx, fish);
        ctx.stroke();
    }

    // Body shape methods
    drawTorpedoBody(ctx, fish) {
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size, fish.size * 0.6, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
    }

    drawDiscBody(ctx, fish) {
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.8, fish.size, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
    }

    drawElongatedBody(ctx, fish) {
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 1.2, fish.size * 0.5, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
    }

    // Pattern methods
    createStripePattern(ctx, fish) {
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        const stripeCount = 4;
        const stripeWidth = fish.size * 2 / stripeCount;
        
        for (let i = 0; i < stripeCount; i += 2) {
            ctx.fillRect(-fish.size + i * stripeWidth, -fish.size, stripeWidth, fish.size * 2);
        }
    }

    createSpotPattern(ctx, fish) {
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        const spotCount = 6;
        
        for (let i = 0; i < spotCount; i++) {
            const angle = (i / spotCount) * Math.PI * 2;
            const radius = fish.size * 0.5;
            const x = Math.cos(angle) * radius * 0.5;
            const y = Math.sin(angle) * radius * 0.3;
            
            ctx.beginPath();
            ctx.arc(x, y, fish.size * 0.15, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    createGradientPattern(ctx, fish) {
        const gradient = ctx.createLinearGradient(-fish.size, 0, fish.size, 0);
        gradient.addColorStop(0, fish.appearance.primaryColor);
        gradient.addColorStop(0.5, fish.appearance.secondaryColor);
        gradient.addColorStop(1, fish.appearance.primaryColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
    }

    createSolidPattern(ctx, fish) {
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
    }

    drawAnimatedFins(ctx, fish) {
        const time = Date.now() * 0.01;
        const tailOffset = Math.sin(time + fish.tailPhase) * fish.tailAmplitude;
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // Tail fin
        ctx.save();
        ctx.translate(-fish.size * 0.8, tailOffset);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-fish.size * 0.4, -fish.size * 0.3);
        ctx.lineTo(-fish.size * 0.4, fish.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.3, -fish.size * 0.6);
        ctx.lineTo(0, -fish.size * 0.8);
        ctx.lineTo(fish.size * 0.3, -fish.size * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Pectoral fins
        ctx.beginPath();
        ctx.ellipse(-fish.size * 0.2, fish.size * 0.4, fish.size * 0.2, fish.size * 0.1, Math.PI * 0.3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(-fish.size * 0.2, -fish.size * 0.4, fish.size * 0.2, fish.size * 0.1, -Math.PI * 0.3, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawEnhancedAnimatedFins(ctx, fish) {
        const tailMovement = this.animator.calculateTailMovement(fish, Date.now() * 0.001);
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // Enhanced tail fin with multi-segment movement
        this.drawEnhancedTailFin(ctx, fish, tailMovement);
        
        // Pectoral fins with rowing motion
        this.drawPectoralFins(ctx, fish);
        
        // Dorsal fin with stabilizing movement
        this.drawDorsalFin(ctx, fish);
        
        // Anal fin for stability
        this.drawAnalFin(ctx, fish);
    }

    drawEnhancedTailFin(ctx, fish, tailMovement) {
        const motionDamping = (fish.fatigueMotionDamping || 1) * (fish.hideMotionDamping || 1);
        const baseOffset = tailMovement.base * motionDamping;
        const midOffset = tailMovement.mid * motionDamping;
        const tipOffset = tailMovement.tip * motionDamping;
        
        // Multi-segment tail for more realistic movement
        ctx.save();
        
        // Base of tail
        ctx.translate(-fish.size * 0.7, baseOffset);
        ctx.rotate(baseOffset * 0.3);
        
        // Main tail fin
        ctx.fillStyle = fish.appearance.secondaryColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-fish.size * 0.3, -fish.size * 0.25);
        ctx.lineTo(-fish.size * 0.4, midOffset - fish.size * 0.15);
        ctx.lineTo(-fish.size * 0.35, tipOffset);
        ctx.lineTo(-fish.size * 0.35, -tipOffset);
        ctx.lineTo(-fish.size * 0.4, -(midOffset - fish.size * 0.15));
        ctx.lineTo(-fish.size * 0.3, fish.size * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // Add tail fin details
        ctx.strokeStyle = this.darkenColor(fish.appearance.secondaryColor, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    drawPectoralFins(ctx, fish) {
        const finAngle = fish.pectoralFinAngle || 0;
        const motionDamping = (fish.fatigueMotionDamping || 1) * (fish.hideMotionDamping || 1);
        
        ctx.save();
        
        // Upper pectoral fin
        ctx.translate(-fish.size * 0.1, -fish.size * 0.3);
        ctx.rotate(finAngle * motionDamping);
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.15, fish.size * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // Lower pectoral fin
        ctx.save();
        ctx.translate(-fish.size * 0.1, fish.size * 0.3);
        ctx.rotate(-finAngle * motionDamping);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.15, fish.size * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }

    drawDorsalFin(ctx, fish) {
        const dorsalOffset = (fish.dorsalFinOffset || 0) * (fish.fatigueMotionDamping || 1);
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // Dorsal fin with subtle movement
        ctx.save();
        ctx.translate(0, -fish.size * 0.6 + dorsalOffset);
        
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.2, 0);
        ctx.lineTo(0, -fish.size * 0.2);
        ctx.lineTo(fish.size * 0.2, 0);
        ctx.lineTo(fish.size * 0.1, fish.size * 0.05);
        ctx.lineTo(-fish.size * 0.1, fish.size * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    drawAnalFin(ctx, fish) {
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // Anal fin for bottom stability
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.4, fish.size * 0.5);
        ctx.lineTo(-fish.size * 0.2, fish.size * 0.7);
        ctx.lineTo(fish.size * 0.1, fish.size * 0.6);
        ctx.lineTo(0, fish.size * 0.5);
        ctx.closePath();
        ctx.fill();
    }

    drawExpressiveEyes(ctx, fish) {
        const eyeSize = fish.size * 0.15;
        const pupilSize = eyeSize * 0.6;
        
        // Eye positions
        const eyeY = -fish.size * 0.1;
        const eyeX = fish.size * 0.3;
        
        // Draw eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw pupils - can look in different directions based on state
        ctx.fillStyle = '#000000';
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (fish.hiding || fish.energy < 30) {
            // Nervous/tired eyes look around
            pupilOffsetX = Math.sin(Date.now() * 0.005) * eyeSize * 0.3;
            pupilOffsetY = Math.cos(Date.now() * 0.003) * eyeSize * 0.2;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX + pupilOffsetX + eyeSize * 0.3, eyeY + pupilOffsetY - eyeSize * 0.3, eyeSize * 0.2, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawAnimatedExpressiveEyes(ctx, fish) {
        const eyeSize = fish.size * 0.15;
        const pupilSize = eyeSize * 0.6;
        
        // Eye positions
        const eyeY = -fish.size * 0.1;
        const eyeX = fish.size * 0.3;
        
        // Get animated eye look direction
        const lookX = fish.eyeLookX || 0;
        const lookY = fish.eyeLookY || 0;
        const blinkAmount = fish.eyeBlinkAmount || 0;
        
        // Draw eye background (sclera)
        ctx.fillStyle = '#FFFFFF';
        ctx.save();
        
        // Apply blinking by scaling vertically
        if (blinkAmount > 0) {
            ctx.translate(eyeX, eyeY);
            ctx.scale(1, 1 - blinkAmount * 0.9);
            ctx.translate(-eyeX, -eyeY);
        }
        
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw pupil with animated looking
        ctx.fillStyle = '#000000';
        let pupilOffsetX = lookX * eyeSize * 0.4;
        let pupilOffsetY = lookY * eyeSize * 0.4;
        
        // State-based eye movement
        if (fish.hiding || fish.energy < 30) {
            // Nervous/tired eyes dart around more
            const nervousTime = Date.now() * 0.008;
            pupilOffsetX += Math.sin(nervousTime) * eyeSize * 0.2;
            pupilOffsetY += Math.cos(nervousTime * 1.3) * eyeSize * 0.15;
        }
        
        // Predator eyes track prey
        if (fish.isPredator && fish.targetPrey) {
            const preyDirection = Math.atan2(fish.targetPrey.y - fish.y, fish.targetPrey.x - fish.x);
            const fishDirection = fish.direction;
            const relativeAngle = preyDirection - fishDirection;
            
            pupilOffsetX = Math.cos(relativeAngle) * eyeSize * 0.3;
            pupilOffsetY = Math.sin(relativeAngle) * eyeSize * 0.3;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eye shine - moves with pupil
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
            eyeX + pupilOffsetX + eyeSize * 0.2, 
            eyeY + pupilOffsetY - eyeSize * 0.2, 
            eyeSize * 0.15, 
            0, 2 * Math.PI
        );
        ctx.fill();
        
        // Iris detail for more realistic look
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize * 1.2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.restore();
    }

    drawStateEffects(ctx, fish) {
        // Health/hunger indicators
        if (fish.hunger > 70) {
            // Draw hunger effect (slightly transparent red overlay)
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
        }
        
        if (fish.energy < 30) {
            // Draw fatigue effect (slightly darker overlay)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(-fish.size, -fish.size, fish.size * 2, fish.size * 2);
        }
        
        if (fish.hiding) {
            // Draw hiding effect (transparency)
            ctx.globalAlpha = 0.6;
        }
    }

    // Utility color methods
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s, l };
    }

    hslToHex(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s;
        const l = hsl.l;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    darkenColor(color, amount) {
        const hsl = this.hexToHsl(color);
        hsl.l = Math.max(0, hsl.l - amount);
        return this.hslToHex(hsl);
    }
}

export default FishAppearanceSystem;