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
            'elongated': this.drawElongatedBody.bind(this),
            'clownfish': this.drawClownfishBody.bind(this),
            'tang': this.drawTangBody.bind(this),
            'butterflyfish': this.drawButterflyfishBody.bind(this),
            'angelfish': this.drawAngelfishBody.bind(this),
            'barracuda': this.drawBarracudaBody.bind(this),
            'shark': this.drawSharkBody.bind(this),
            'lionfish': this.drawLionfishBody.bind(this),
            'communist': this.drawCommunistFishBody.bind(this)
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
            'Peixe-palhaço': {
                bodyShapes: ['clownfish'],
                patterns: ['stripes'],
                baseColor: '#FF7F00',
                baseSize: 20,
                finStyles: ['rounded'],
                eyeStyles: ['large']
            },
            'Cirurgião-azul': {
                bodyShapes: ['tang'],
                patterns: ['solid', 'gradient'],
                baseColor: '#1E90FF',
                baseSize: 25,
                finStyles: ['normal'],
                eyeStyles: ['round']
            },
            'Peixe-borboleta': {
                bodyShapes: ['butterflyfish'],
                patterns: ['stripes', 'spots'],
                baseColor: '#FFD700',
                baseSize: 20,
                finStyles: ['delicate'],
                eyeStyles: ['round']
            },
            'Peixe-anjo': {
                bodyShapes: ['angelfish'],
                patterns: ['gradient', 'stripes'],
                baseColor: '#9370DB',
                baseSize: 30,
                finStyles: ['flowing'],
                eyeStyles: ['round']
            },
            'Barracuda': {
                bodyShapes: ['barracuda'],
                patterns: ['solid', 'spots'],
                baseColor: '#708090',
                baseSize: 40,
                finStyles: ['sharp'],
                eyeStyles: ['predator']
            },
            'Tubarão-recife': {
                bodyShapes: ['shark'],
                patterns: ['solid'],
                baseColor: '#A9A9A9',
                baseSize: 50,
                finStyles: ['shark'],
                eyeStyles: ['predator']
            },
            'Peixe-leão': {
                bodyShapes: ['lionfish'],
                patterns: ['stripes'],
                baseColor: '#B22222',
                baseSize: 35,
                finStyles: ['elaborate'],
                eyeStyles: ['predator']
            },
            'Peixe Comunista': {
                bodyShapes: ['communist'],
                patterns: ['solid'],
                baseColor: '#DC143C',
                baseSize: 30,
                finStyles: ['revolutionary'],
                eyeStyles: ['determined']
            },
            // Fallback for unknown species
            'common': {
                bodyShapes: ['torpedo'],
                patterns: ['solid'],
                baseColor: '#4CAF50',
                baseSize: 20,
                finStyles: ['normal'],
                eyeStyles: ['round']
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

        // Update fish direction to match velocity for proper alignment
        if (fish.velocity && (fish.velocity.x !== 0 || fish.velocity.y !== 0)) {
            const targetDirection = Math.atan2(fish.velocity.y, fish.velocity.x);
            
            // Smooth rotation - interpolate between current and target direction
            if (fish.direction !== undefined) {
                let angleDiff = targetDirection - fish.direction;
                // Normalize angle difference to [-PI, PI]
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                
                // Smoothly rotate (adjust 0.15 for rotation speed)
                fish.direction += angleDiff * 0.15;
            } else {
                fish.direction = targetDirection;
            }
        }

        // Update fish animations before rendering
        this.animator.updateFishAnimations(fish, 16); // Assuming 60 FPS (16ms per frame)

        ctx.save();
        
        // Apply fish transformations
        ctx.translate(fish.position.x, fish.position.y);
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

    // Species-specific body shapes with realistic characteristics
    
    drawClownfishBody(ctx, fish) {
        // Rounded, compact oval body - characteristic of clownfish
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.9, fish.size * 0.65, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add distinctive white stripes (drawn on body)
        ctx.fillStyle = '#FFFFFF';
        // Head stripe
        ctx.fillRect(fish.size * 0.3, -fish.size * 0.65, fish.size * 0.25, fish.size * 1.3);
        // Middle stripe
        ctx.fillRect(-fish.size * 0.1, -fish.size * 0.65, fish.size * 0.2, fish.size * 1.3);
        // Tail stripe
        ctx.fillRect(-fish.size * 0.6, -fish.size * 0.65, fish.size * 0.15, fish.size * 1.3);
    }

    drawTangBody(ctx, fish) {
        // Oval, laterally compressed - typical of surgeonfish/tangs
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.85, fish.size * 0.95, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add characteristic tail scalpel (surgeonfish feature)
        ctx.fillStyle = this.darkenColor(fish.appearance.primaryColor, 0.4);
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.75, fish.size * 0.3);
        ctx.lineTo(-fish.size * 0.85, fish.size * 0.35);
        ctx.lineTo(-fish.size * 0.75, fish.size * 0.4);
        ctx.fill();
    }

    drawButterflyfishBody(ctx, fish) {
        // Tall, thin disc - characteristic tall body of butterflyfish
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.7, fish.size, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add eye spot (false eye pattern common in butterflyfish)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-fish.size * 0.5, -fish.size * 0.6, fish.size * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-fish.size * 0.5, -fish.size * 0.6, fish.size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawAngelfishBody(ctx, fish) {
        // Triangular, elegant - characteristic angelfish shape
        ctx.beginPath();
        // Create a more triangular, tall body
        ctx.moveTo(fish.size * 0.6, 0);
        // Top curve
        ctx.bezierCurveTo(
            fish.size * 0.4, -fish.size * 0.8,
            -fish.size * 0.2, -fish.size * 1.1,
            -fish.size * 0.7, -fish.size * 0.4
        );
        // Back
        ctx.lineTo(-fish.size * 0.8, 0);
        // Bottom curve
        ctx.bezierCurveTo(
            -fish.size * 0.2, fish.size * 1.1,
            fish.size * 0.4, fish.size * 0.8,
            fish.size * 0.6, 0
        );
        ctx.closePath();
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
    }

    drawBarracudaBody(ctx, fish) {
        // Long, sleek, torpedo shape - built for speed
        ctx.beginPath();
        // Elongated streamlined body
        ctx.ellipse(0, 0, fish.size * 1.4, fish.size * 0.35, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add characteristic pointed snout
        ctx.beginPath();
        ctx.moveTo(fish.size * 1.4, 0);
        ctx.lineTo(fish.size * 1.7, fish.size * 0.1);
        ctx.lineTo(fish.size * 1.7, -fish.size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Add darker back stripe (common in barracudas)
        ctx.fillStyle = this.darkenColor(fish.appearance.primaryColor, 0.3);
        ctx.beginPath();
        ctx.ellipse(0, -fish.size * 0.25, fish.size * 1.3, fish.size * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawSharkBody(ctx, fish) {
        // Classic shark silhouette - streamlined with distinctive shape
        ctx.beginPath();
        // Main body
        ctx.moveTo(fish.size * 1.2, 0);
        // Top curve with dorsal hump
        ctx.bezierCurveTo(
            fish.size * 0.8, -fish.size * 0.45,
            fish.size * 0.2, -fish.size * 0.5,
            -fish.size * 0.8, -fish.size * 0.3
        );
        // Tail top
        ctx.lineTo(-fish.size * 1.3, -fish.size * 0.6);
        ctx.lineTo(-fish.size * 1.1, -fish.size * 0.15);
        // Tail bottom
        ctx.lineTo(-fish.size * 1.2, fish.size * 0.2);
        ctx.lineTo(-fish.size * 0.8, fish.size * 0.25);
        // Bottom curve
        ctx.bezierCurveTo(
            fish.size * 0.2, fish.size * 0.4,
            fish.size * 0.8, fish.size * 0.35,
            fish.size * 1.2, 0
        );
        ctx.closePath();
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add gills
        ctx.strokeStyle = this.darkenColor(fish.appearance.primaryColor, 0.3);
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(fish.size * 0.3 - i * fish.size * 0.15, -fish.size * 0.35);
            ctx.lineTo(fish.size * 0.25 - i * fish.size * 0.15, fish.size * 0.3);
            ctx.stroke();
        }
    }

    drawLionfishBody(ctx, fish) {
        // Compact body with elaborate spiny fins
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.8, fish.size * 0.7, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add characteristic red/white stripes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = fish.size * 0.08;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(fish.size * 0.6, i * fish.size * 0.2);
            ctx.lineTo(-fish.size * 0.6, i * fish.size * 0.2);
            ctx.stroke();
        }
        
        // Venomous spines will be drawn as part of fins
    }

    drawCommunistFishBody(ctx, fish) {
        // Strong, sturdy worker's body with revolutionary characteristics
        ctx.beginPath();
        // Robust oval shape
        ctx.ellipse(0, 0, fish.size * 0.95, fish.size * 0.7, 0, 0, 2 * Math.PI);
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.fill();
        
        // Add hammer and sickle symbol
        ctx.save();
        ctx.fillStyle = '#FFD700'; // Gold color for symbol
        ctx.translate(fish.size * 0.1, 0);
        ctx.scale(fish.size * 0.015, fish.size * 0.015);
        
        // Draw simplified hammer
        ctx.fillRect(-8, -15, 4, 20);
        ctx.fillRect(-15, -15, 18, 5);
        
        // Draw simplified sickle
        ctx.beginPath();
        ctx.arc(5, 0, 12, Math.PI * 0.5, Math.PI * 1.8);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFD700';
        ctx.stroke();
        
        ctx.restore();
        
        // Add red star on forehead
        ctx.fillStyle = '#FFD700';
        this.drawStar(ctx, fish.size * 0.5, -fish.size * 0.3, fish.size * 0.2, 5);
    }

    // Helper method to draw a star
    drawStar(ctx, cx, cy, radius, points) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const x = Math.cos(angle - Math.PI / 2) * r;
            const y = Math.sin(angle - Math.PI / 2) * r;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
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
        const species = fish.species;
        
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // Draw species-specific fins based on fish type
        switch(species) {
            case 'Peixe-leão':
                this.drawLionfishFins(ctx, fish, tailMovement);
                break;
            case 'Tubarão-recife':
                this.drawSharkFins(ctx, fish, tailMovement);
                break;
            case 'Barracuda':
                this.drawBarracudaFins(ctx, fish, tailMovement);
                break;
            case 'Peixe-anjo':
                this.drawAngelfishFins(ctx, fish, tailMovement);
                break;
            default:
                // Standard fins for most species
                this.drawEnhancedTailFin(ctx, fish, tailMovement);
                this.drawPectoralFins(ctx, fish);
                this.drawDorsalFin(ctx, fish);
                this.drawAnalFin(ctx, fish);
                break;
        }
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

    // Species-specific fin drawing methods
    
    drawLionfishFins(ctx, fish, tailMovement) {
        // Lionfish has elaborate, venomous spines
        ctx.fillStyle = fish.appearance.secondaryColor;
        ctx.strokeStyle = fish.appearance.primaryColor;
        ctx.lineWidth = 2;
        
        // Dorsal spines - very elaborate
        const spineCount = 13;
        for (let i = 0; i < spineCount; i++) {
            const x = fish.size * 0.6 - (i / spineCount) * fish.size * 1.2;
            const length = fish.size * (0.8 + Math.sin(i * 0.5) * 0.3);
            
            ctx.save();
            ctx.translate(x, -fish.size * 0.5);
            ctx.rotate(-Math.PI * 0.3 + i * 0.1);
            
            // Draw spine with membrane
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-length * 0.3, -length);
            ctx.lineTo(length * 0.3, -length);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Pectoral fins - fan-like
        ctx.save();
        ctx.translate(fish.size * 0.3, 0);
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-fish.size * 0.4, i * fish.size * 0.15);
            ctx.strokeStyle = fish.appearance.secondaryColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
        
        // Simple tail
        this.drawEnhancedTailFin(ctx, fish, tailMovement);
    }

    drawSharkFins(ctx, fish, tailMovement) {
        // Dorsal fin - iconic triangular shark fin
        ctx.fillStyle = fish.appearance.primaryColor;
        ctx.beginPath();
        ctx.moveTo(fish.size * 0.2, -fish.size * 0.5);
        ctx.lineTo(fish.size * 0.4, -fish.size * 1.1);
        ctx.lineTo(fish.size * 0.6, -fish.size * 0.5);
        ctx.bezierCurveTo(
            fish.size * 0.5, -fish.size * 0.6,
            fish.size * 0.3, -fish.size * 0.6,
            fish.size * 0.2, -fish.size * 0.5
        );
        ctx.closePath();
        ctx.fill();
        
        // Pectoral fins - wide and wing-like
        ctx.save();
        ctx.translate(fish.size * 0.4, fish.size * 0.35);
        ctx.rotate(Math.PI * 0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.4, fish.size * 0.15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        
        // Tail is already part of the body shape
    }

    drawBarracudaFins(ctx, fish, tailMovement) {
        // Small, efficient fins for a speed predator
        
        // Two small dorsal fins
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // First dorsal
        ctx.beginPath();
        ctx.moveTo(fish.size * 0.3, -fish.size * 0.35);
        ctx.lineTo(fish.size * 0.4, -fish.size * 0.6);
        ctx.lineTo(fish.size * 0.5, -fish.size * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // Second dorsal
        ctx.beginPath();
        ctx.moveTo(-fish.size * 0.3, -fish.size * 0.3);
        ctx.lineTo(-fish.size * 0.2, -fish.size * 0.5);
        ctx.lineTo(-fish.size * 0.1, -fish.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Forked tail for speed
        const motionDamping = (fish.fatigueMotionDamping || 1) * (fish.hideMotionDamping || 1);
        const baseOffset = tailMovement.base * motionDamping;
        
        ctx.save();
        ctx.translate(-fish.size * 1.4, baseOffset);
        
        ctx.beginPath();
        // Upper fork
        ctx.moveTo(0, 0);
        ctx.lineTo(-fish.size * 0.35, -fish.size * 0.45);
        ctx.lineTo(-fish.size * 0.3, -fish.size * 0.3);
        // Lower fork
        ctx.lineTo(-fish.size * 0.3, fish.size * 0.3);
        ctx.lineTo(-fish.size * 0.35, fish.size * 0.45);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Small pectoral fins
        ctx.save();
        ctx.translate(fish.size * 0.5, fish.size * 0.25);
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.15, fish.size * 0.08, Math.PI * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    drawAngelfishFins(ctx, fish, tailMovement) {
        // Flowing, elegant fins
        ctx.fillStyle = fish.appearance.secondaryColor;
        
        // The dorsal and anal fins are integrated into the body shape
        // Just add the tail
        const motionDamping = (fish.fatigueMotionDamping || 1) * (fish.hideMotionDamping || 1);
        const baseOffset = tailMovement.base * motionDamping;
        
        ctx.save();
        ctx.translate(-fish.size * 0.7, baseOffset);
        
        // Flowing tail fin
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            -fish.size * 0.2, -fish.size * 0.4,
            -fish.size * 0.3, -fish.size * 0.5,
            -fish.size * 0.3, -fish.size * 0.3
        );
        ctx.lineTo(-fish.size * 0.3, fish.size * 0.3);
        ctx.bezierCurveTo(
            -fish.size * 0.3, fish.size * 0.5,
            -fish.size * 0.2, fish.size * 0.4,
            0, 0
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Delicate pectoral fins
        this.drawPectoralFins(ctx, fish);
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
            const preyDirection = Math.atan2(fish.targetPrey.position.y - fish.position.y, fish.targetPrey.position.x - fish.position.x);
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