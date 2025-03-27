import Entity from './entity.js';

class Jellyfish extends Entity {
    constructor(x, y, size, color) {
        super(x, y, size);
        this.species = "Água-viva";
        this.color = color || this.getRandomJellyfishColor();
        this.tentacleLength = size * 2;
        this.tentacleCount = Math.floor(Math.random() * 5) + 5; // 5-9 tentáculos
        this.pulsationFrame = 0;
        this.pulsationRate = 0.05;
        this.maxSpeed = 1; // Águas-vivas são mais lentas
        this.direction = { x: 0, y: -1 }; // Tendência a subir
        this.tentacleOffset = [];
        
        // Inicializa os deslocamentos dos tentáculos
        for (let i = 0; i < this.tentacleCount; i++) {
            this.tentacleOffset.push(Math.random() * Math.PI * 2);
        }
    }
    
    getRandomJellyfishColor() {
        const colors = [
            "#FF6EC7", // Rosa fluorescente
            "#5CB3FF", // Azul claro
            "#9EE09E", // Verde claro
            "#BA55D3", // Roxo médio
            "#FFC0CB"  // Rosa claro
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        if (!this.alive) return;
        
        // Reduzindo a velocidade de pulsação para 1/3 do valor original
        this.pulsationRate = 0.05; // Reduzido de 0.05 para 0.017
        
        // Atualização da pulsação
        this.pulsationFrame += this.pulsationRate;
        
        // Movimento de deriva
        this.drift();
        
        super.update();
    }
    
    drift() {
        // Águas-vivas tendem a subir com pequenos movimentos laterais
        if (Math.random() < 0.02) {
            this.direction = {
                x: (Math.random() - 0.5) * 0.5,
                y: -0.5 - Math.random() * 0.5
            };
        }
        
        // Aplica a força de propulsão com base na pulsação
        const pulsationPower = Math.sin(this.pulsationFrame) * 0.05;
        this.applyForce({
            x: this.direction.x * pulsationPower,
            y: this.direction.y * pulsationPower
        });
        
        // Correntes aleatórias
        if (Math.random() < 0.1) {
            this.applyForce({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02
            });
        }
    }
    
    think() {
        const thoughts = [
            "Flutuando tranquilamente...",
            "Seguindo as correntes...",
            "Tão pacífico aqui em cima...",
            "Deixando-me levar..."
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }
    
    display() {
        if (!this.alive) return;
        
        const ctx = window._renderer.drawingContext;
        
        // Fator de pulsação que afeta o tamanho da campânula
        // Reduzindo a amplitude da pulsação
        const pulseFactor = 0.9 + Math.sin(this.pulsationFrame) * 0.1; // Reduzido de 0.8+0.2 para 0.9+0.1
        
        // Campânula (corpo principal)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.size * pulseFactor,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Brilho interno
        const gradient = ctx.createRadialGradient(
            this.position.x,
            this.position.y,
            this.size * 0.3,
            this.position.x,
            this.position.y,
            this.size * pulseFactor
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.size * pulseFactor,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Tentáculos
        ctx.strokeStyle = this.color;
        
        for (let i = 0; i < this.tentacleCount; i++) {
            const angle = (Math.PI * 2 / this.tentacleCount) * i;
            const waveOffset = this.tentacleOffset[i];
            
            ctx.beginPath();
            ctx.moveTo(
                this.position.x + Math.cos(angle) * this.size * 0.8,
                this.position.y + Math.sin(angle) * this.size * 0.8
            );
            
            // Desenha tentáculo ondulado
            const segments = 10;
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const waveAmplitude = this.size * 0.3 * t;
                // Reduzindo a frequência para um movimento mais suave
                const waveFrequency = 1.5; // Reduzido de 3 para 1.5
                // Reduzindo a velocidade da animação
                const wavePhase = this.pulsationFrame * 0.5 + waveOffset; // Multiplicando por 0.5 para reduzir velocidade
                
                const xOffset = Math.cos(t * waveFrequency + wavePhase) * waveAmplitude;
                const x = this.position.x + 
                          Math.cos(angle) * this.size * 0.8 + 
                          xOffset + 
                          Math.cos(angle + Math.PI/2) * waveAmplitude;
                          
                const y = this.position.y + 
                          Math.sin(angle) * this.size * 0.8 + 
                          t * this.tentacleLength;
                
                ctx.lineTo(x, y);
            }
            
            ctx.lineWidth = this.size * 0.05;
            ctx.stroke();
        }
    }
}

export default Jellyfish;