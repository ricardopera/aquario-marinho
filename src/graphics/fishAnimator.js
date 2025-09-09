// src/graphics/fishAnimator.js - Realistic Fish Animation System

class FishAnimator {
    constructor() {
        this.animationCache = new Map();
    }

    // Enhanced swimming animation with body ondulation
    applySwimmingAnimation(fish, deltaTime = 16) {
        const time = Date.now() * 0.001;
        const velocity = fish.velocity || { x: 0, y: 0 };
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // Calculate animation parameters based on fish movement
        const animationIntensity = Math.min(speed / fish.maxSpeed, 1);
        const baseFrequency = fish.isPredator ? 0.8 : 1.2; // Predators swim more slowly but powerfully
        const frequency = baseFrequency * (0.5 + animationIntensity * 0.5);
        
        // Body undulation - more pronounced when fish is moving faster
        this.applyBodyUndulation(fish, time, frequency, animationIntensity);
        
        // Fin animation - adapt to swimming intensity
        this.animateFins(fish, time, frequency, animationIntensity);
        
        // Subtle banking/tilting when turning
        this.applyTurningAnimation(fish, deltaTime);
    }

    applyBodyUndulation(fish, time, frequency, intensity) {
        // Create a wave-like motion along the fish body
        const segments = 8; // Number of body segments for smooth undulation
        const amplitude = fish.size * 0.1 * intensity; // Wave amplitude
        const waveLength = fish.size * 1.5; // Length of one complete wave
        
        // Apply subtle body wave transformation
        // This creates a sinusoidal deformation along the fish's length
        const waveOffset = time * frequency * Math.PI * 2;
        
        for (let i = 0; i < segments; i++) {
            const segmentRatio = i / segments;
            const x = (segmentRatio - 0.5) * fish.size * 2;
            const wavePhase = (x / waveLength) * Math.PI * 2 + waveOffset;
            const waveY = Math.sin(wavePhase) * amplitude * (1 - segmentRatio * 0.5); // Amplitude decreases towards head
            
            // Store wave information for use in rendering
            if (!fish.bodyWave) fish.bodyWave = [];
            fish.bodyWave[i] = { x, y: waveY, phase: wavePhase };
        }
    }

    animateFins(fish, time, frequency, intensity) {
        const finAnimationSpeed = frequency * 2; // Fins move faster than body
        
        // Pectoral fins - rowing motion
        fish.pectoralFinAngle = Math.sin(time * finAnimationSpeed) * (Math.PI / 6) * intensity;
        
        // Tail fin - powerful propulsion motion
        const tailBaseAmplitude = fish.isPredator ? 0.4 : 0.3;
        fish.tailFinAngle = Math.sin(time * finAnimationSpeed + Math.PI) * tailBaseAmplitude * intensity;
        
        // Dorsal fin - subtle stabilizing motion
        fish.dorsalFinOffset = Math.sin(time * finAnimationSpeed * 0.7) * fish.size * 0.05 * intensity;
        
        // Caudal fin - varies with swimming effort
        const caudalIntensity = 0.8 + intensity * 0.4;
        fish.caudalFinSpread = caudalIntensity;
    }

    applyTurningAnimation(fish, deltaTime) {
        // Calculate angular velocity to determine turning intensity
        const velocity = fish.velocity || { x: 0, y: 0 };
        const currentDirection = Math.atan2(velocity.y, velocity.x);
        const targetDirection = fish.direction;
        
        // Calculate the shortest angular distance
        let angularDifference = targetDirection - currentDirection;
        while (angularDifference > Math.PI) angularDifference -= 2 * Math.PI;
        while (angularDifference < -Math.PI) angularDifference += 2 * Math.PI;
        
        // Apply banking/tilting based on turning rate
        const turningRate = Math.abs(angularDifference) * 60 / deltaTime; // Convert to degrees per second
        const maxBankAngle = Math.PI / 12; // 15 degrees maximum bank
        const bankAngle = Math.min(turningRate * 0.1, 1) * maxBankAngle * Math.sign(angularDifference);
        
        // Store banking information for rendering
        fish.bankAngle = bankAngle;
        
        // Add subtle body tilt during sharp turns
        fish.bodyTilt = bankAngle * 0.5;
    }

    // Enhanced tail animation with more realistic physics
    calculateTailMovement(fish, time) {
        const velocity = fish.velocity || { x: 0, y: 0 };
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const speedRatio = speed / fish.maxSpeed;
        
        // Base tail movement parameters
        const baseFrequency = fish.isPredator ? 0.6 : 0.8;
        const frequency = baseFrequency * (0.3 + speedRatio * 0.7);
        const amplitude = fish.tailAmplitude * (0.4 + speedRatio * 0.6);
        
        // Phase offset creates the wave motion along the tail
        const phase1 = time * frequency + fish.tailPhase;
        const phase2 = phase1 - Math.PI / 3; // Secondary segment lags behind
        const phase3 = phase2 - Math.PI / 3; // Tertiary segment lags further
        
        return {
            base: Math.sin(phase1) * amplitude,
            mid: Math.sin(phase2) * amplitude * 0.8,
            tip: Math.sin(phase3) * amplitude * 0.6,
            frequency: frequency
        };
    }

    // Breathing animation - subtle gill movement
    applyBreathingAnimation(fish, time) {
        const breathingRate = fish.isPredator ? 0.8 : 1.2; // Predators breathe slower
        const breathingPhase = time * breathingRate;
        
        // Subtle gill expansion/contraction
        fish.gillExpansion = (Math.sin(breathingPhase) + 1) * 0.5; // Normalize to 0-1
        
        // Subtle body size variation with breathing
        const breathingAmplitude = 0.02; // 2% size variation
        fish.breathingScale = 1 + Math.sin(breathingPhase) * breathingAmplitude;
    }

    // Eye movement animation - fish look around occasionally
    animateEyes(fish, time) {
        // Occasional eye movement - fish look around when not focused on something
        if (!fish.eyeTarget) {
            const lookAroundFrequency = 0.3; // Look around every ~3 seconds
            const lookPhase = time * lookAroundFrequency;
            
            fish.eyeLookX = Math.sin(lookPhase * 1.3) * 0.3;
            fish.eyeLookY = Math.sin(lookPhase * 0.9) * 0.2;
            
            // Blinking animation
            const blinkFrequency = 0.1; // Blink approximately every 10 seconds
            const blinkPhase = (time * blinkFrequency) % 1;
            fish.eyeBlinkAmount = blinkPhase < 0.1 ? Math.sin(blinkPhase * Math.PI * 10) : 0;
        }
    }

    // School formation swimming - synchronized movement
    applySynchronizedSwimming(fish, schoolMates, time) {
        if (!schoolMates || schoolMates.length === 0) return;
        
        // Calculate average phase of school mates for synchronization
        let averagePhase = 0;
        let phaseCount = 0;
        
        schoolMates.forEach(mate => {
            if (mate.tailPhase !== undefined) {
                averagePhase += mate.tailPhase;
                phaseCount++;
            }
        });
        
        if (phaseCount > 0) {
            averagePhase /= phaseCount;
            
            // Gradually synchronize with school
            const syncStrength = 0.02; // How strongly to sync (lower = more gradual)
            const targetPhase = averagePhase + time * fish.tailFrequency;
            
            // Smooth phase adjustment
            let phaseDiff = targetPhase - fish.tailPhase;
            while (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
            while (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;
            
            fish.tailPhase += phaseDiff * syncStrength;
        }
    }

    // State-based animation modifications
    applyStateAnimations(fish, time) {
        // Hungry fish move more erratically
        if (fish.hunger > 70) {
            const nervousFrequency = 2.5;
            const nervousAmplitude = 0.1;
            fish.nervousMovement = Math.sin(time * nervousFrequency) * nervousAmplitude;
        } else {
            fish.nervousMovement = 0;
        }
        
        // Tired fish move more slowly and less smoothly
        if (fish.energy < 30) {
            fish.fatigueMotionDamping = 0.7; // Reduce animation intensity
            fish.fatigueFrequencyReduction = 0.6; // Slower movements
        } else {
            fish.fatigueMotionDamping = 1.0;
            fish.fatigueFrequencyReduction = 1.0;
        }
        
        // Hiding fish try to stay very still
        if (fish.hiding) {
            fish.hideMotionDamping = 0.3;
        } else {
            fish.hideMotionDamping = 1.0;
        }
        
        // Predator alert state - more rigid, focused swimming
        if (fish.isPredator && fish.targetPrey) {
            fish.huntingRigidity = 0.8; // Less undulation, more direct movement
        } else {
            fish.huntingRigidity = 1.0;
        }
    }

    // Update all animations for a fish
    updateFishAnimations(fish, deltaTime, schoolMates) {
        const time = Date.now() * 0.001;
        
        // Apply all animation systems
        this.applySwimmingAnimation(fish, deltaTime);
        this.applyBreathingAnimation(fish, time);
        this.animateEyes(fish, time);
        this.applyStateAnimations(fish, time);
        
        // Apply schooling synchronization if applicable
        if (schoolMates && schoolMates.length > 0) {
            this.applySynchronizedSwimming(fish, schoolMates, time);
        }
    }
}

export default FishAnimator;