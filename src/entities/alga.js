import Entity from './entity.js';
import { addVectors } from '../utils/vector.js';

class Alga extends Entity {
    constructor(x, y, height, segments) {
        super(x, y, height/10);
        this.segments = segments || Math.floor(Math.random() * 5) + 3;
        this.height = height || 50 + Math.random() * 100;
        this.width = 5 + Math.random() * 15;
        this.color = this.getRandomAlgaColor();
        this.swayPhase = Math.random() * Math.PI * 2;
        // Reduzindo a velocidade de ondulação das algas
        this.swaySpeed = 0.2 + Math.random() * 0.3; // Reduzido de 0.5-1.0 para 0.2-0.5
        this.segmentAngles = [];
        
        // Inicializa os ângulos dos segmentos
        for (let i = 0; i < this.segments; i++) {
            this.segmentAngles.push(Math.random() * 0.2 - 0.1);
        }
    }
    
    getRandomAlgaColor() {
        const colors = [
            "#3CB371", // Verde médio do mar
            "#2E8B57", // Verde mar escuro
            "#32CD32", // Verde lima
            "#00FA9A", // Verde primavera médio
            "#00FF7F"  // Verde primavera
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        if (!this.alive) return;
        
        // Calcula a fase da ondulação baseada no tempo
        // Reduzindo a velocidade da ondulação
        const time = Date.now() * 0.0005; // Reduzido de 0.001 para 0.0005
        this.swayPhase = time * this.swaySpeed;
        
        // Atualiza os ângulos dos segmentos
        for (let i = 0; i < this.segments; i++) {
            this.segmentAngles[i] = Math.sin(this.swayPhase + i * 0.2) * 0.2;
        }
    }
    
    beEaten(amount) {
        this.height -= amount;
        this.size -= amount / 10;
        
        if (this.height <= 10 || this.size <= 0) {
            this.die();
        }
    }
    
    display() {
        if (!this.alive) return;
        
        const ctx = window._renderer.drawingContext;
        
        // Reduzindo a velocidade da animação de ondas
        const time = Date.now() * 0.0005; // Reduzido de 0.001 para 0.0005
        
        ctx.save();
        
        // Ponto base da alga (enraizada no fundo)
        let baseX = this.position.x;
        let baseY = this.position.y;
        
        // Desenha os segmentos da alga
        for (let i = 0; i < this.segments; i++) {
            const segmentHeight = this.height / this.segments;
            const angle = this.segmentAngles[i];
            
            // Calcula o efeito de ondulação lateral
            const offsetX = Math.sin(time + i * 0.3) * (i * 2);
            
            // Tamanho do segmento diminui gradualmente em direção ao topo
            const segmentWidth = this.width * (1 - i / this.segments * 0.5);
            
            // Cor fica mais clara em direção ao topo
            const brightness = 40 + (i / this.segments) * 30;
            ctx.fillStyle = `hsl(${this.getHue(this.color)}, 70%, ${brightness}%)`;
            
            // Desenha o segmento como uma elipse
            ctx.beginPath();
            ctx.ellipse(
                baseX + offsetX,
                baseY - i * segmentHeight,
                segmentWidth / 2,
                segmentHeight / 2,
                angle,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // O próximo segmento começa onde este termina
            baseX += Math.sin(angle) * segmentHeight;
            baseY -= Math.cos(angle) * segmentHeight;
        }
        
        ctx.restore();
    }
    
    // Extrai o matiz (hue) de uma cor CSS
    getHue(color) {
        // Para simplificar, assumimos que são cores em formato de nome
        const colorMap = {
            "#3CB371": 120, // Verde médio do mar
            "#2E8B57": 150, // Verde mar escuro
            "#32CD32": 90,  // Verde lima
            "#00FA9A": 160, // Verde primavera médio
            "#00FF7F": 140  // Verde primavera
        };
        
        return colorMap[color] || 120; // Verde padrão se não encontrado
    }
}

export default Alga;
