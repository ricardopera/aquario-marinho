import Entity from './entity.js';

class Coral extends Entity {
    constructor(x, y, size, color) {
        super(x, y, size);
        this.color = color || this.getRandomCoralColor();
        this.maxSize = size * 1.5;
        this.growthRate = 0.001;
        this.branches = Math.floor(Math.random() * 5) + 3; // 3-7 ramos
        this.branchAngles = [];
        this.branchLengths = [];
        
        // Inicializa os ângulos e comprimentos dos ramos
        for (let i = 0; i < this.branches; i++) {
            this.branchAngles.push(Math.random() * Math.PI * 2);
            this.branchLengths.push(0.5 + Math.random() * 0.5);
        }
    }
    
    getRandomCoralColor() {
        const colors = [
            "#FF6F61", // Coral vivo
            "#FFB347", // Coral laranja
            "#FF69B4", // Coral rosa
            "#9370DB", // Coral púrpura
            "#20B2AA"  // Coral turquesa
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        if (!this.alive) return;
        
        // Crescimento lento do coral
        if (this.size < this.maxSize) {
            this.size += this.growthRate;
        }
    }
    
    beEaten(amount) {
        this.size -= amount;
        if (this.size <= 0) {
            this.die();
        }
    }
    
    display() {
        if (!this.alive) return;
        
        const ctx = window._renderer.drawingContext;
        
        // Base do coral
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ramos do coral
        for (let i = 0; i < this.branches; i++) {
            const angle = this.branchAngles[i];
            const length = this.branchLengths[i] * this.size;
            
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(angle);
            
            // Desenha um ramo como uma forma orgânica
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                length * 0.3, length * 0.1,
                length * 0.7, length * 0.2,
                length, 0
            );
            ctx.bezierCurveTo(
                length * 0.7, -length * 0.2,
                length * 0.3, -length * 0.1,
                0, 0
            );
            ctx.fillStyle = this.adjustColor(this.color, i);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Cria variações de cor para os diferentes ramos
    adjustColor(baseColor, index) {
        // Converte cor hex para RGB
        let r = parseInt(baseColor.slice(1, 3), 16);
        let g = parseInt(baseColor.slice(3, 5), 16);
        let b = parseInt(baseColor.slice(5, 7), 16);
        
        // Ajusta a cor com base no índice
        r = Math.min(255, r + (index * 10 - 20));
        g = Math.min(255, g + (index * 5 - 10));
        b = Math.min(255, b + (index * 8 - 15));
        
        // Converte de volta para hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    grow(amount) {
        this.size = Math.min(this.maxSize, this.size + amount);
    }
}

export default Coral;