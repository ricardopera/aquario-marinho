import Entity from './entity.js';
import { addVectors } from '../utils/vector.js';

class Bubble extends Entity {
    constructor(x, y, size) {
        super(x, y, size || 2 + Math.random() * 8);
        this.speed = 0.5 + Math.random() * 2;
        this.wobbleAmount = 0.5;
        this.wobbleSpeed = 0.05;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.3 + Math.random() * 0.5;
        this.maxSpeed = this.speed;
    }

    update() {
        // Aplicar movimento ascendente
        this.applyForce({ x: 0, y: -this.speed * 0.05 });
        
        // Adicionar movimento lateral de ondulação
        const time = Date.now() * 0.001;
        const wobble = Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmount;
        this.applyForce({ x: wobble * 0.001, y: 0 });
        
        super.update();
        
        // Verifica se a bolha saiu da tela
        if (this.position.y + this.size < 0) {
            this.die();
        }
    }
    
    display() {
        if (!this.alive) return;
        
        const ctx = window._renderer.drawingContext;
        
        ctx.save();
        
        // Gradiente circular para dar efeito de reflexo
        const gradient = ctx.createRadialGradient(
            this.position.x - this.size * 0.3,
            this.position.y - this.size * 0.3,
            this.size * 0.1,
            this.position.x,
            this.position.y,
            this.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity + 0.2})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity - 0.1})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Adiciona um pequeno reflexo
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + 0.5})`;
        ctx.beginPath();
        ctx.arc(
            this.position.x - this.size * 0.3,
            this.position.y - this.size * 0.3,
            this.size * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    // Faz a bolha estourar
    pop() {
        // Criaria um efeito visual de estouro aqui
        this.die();
    }
}

export default Bubble;
