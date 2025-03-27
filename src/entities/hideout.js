import Entity from './entity.js';

class Hideout extends Entity {
    constructor(x, y, size) {
        super(x, y, size);
        this.location = { x, y };
        this.capacity = Math.floor(size / 10); // Capacidade baseada no tamanho
        this.occupants = [];
        this.color = this.getRandomHideoutColor();
        this.openingAngle = Math.random() * Math.PI * 2; // Ângulo da abertura
        this.openingSize = Math.PI / 3; // Tamanho da abertura em radianos
        
        // Adicionando propriedades para controlar a animação das texturas
        this.textureSeed = Math.random() * 1000;
        this.textureLines = [];
        
        // Gerar linhas de textura fixas para evitar animação rápida
        this.generateTextureLines();
    }
    
    getRandomHideoutColor() {
        const colors = [
            "#8B4513", // Marrom
            "#A52A2A", // Marrom avermelhado
            "#D2691E", // Chocolate
            "#696969", // Cinza escuro
            "#556B2F"  // Verde oliva escuro
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Gerar linhas de textura uma vez na inicialização
    generateTextureLines() {
        for (let i = 0; i < 5; i++) {
            const angle = (this.textureSeed + i * 50) % (Math.PI * 2);
            const length = (this.textureSeed % 50 + 50) / 100 * this.size * 0.8;
            const startX = this.position.x + Math.cos(angle) * this.size * 0.5;
            const startY = this.position.y + Math.sin(angle) * this.size * 0.5;
            
            // Pontos de controle da curva Bezier para definir a forma da linha
            const control1X = startX + Math.cos(angle + Math.PI/4) * (length * 0.33);
            const control1Y = startY + Math.sin(angle + Math.PI/4) * (length * 0.33);
            const control2X = startX + Math.cos(angle - Math.PI/4) * (length * 0.66);
            const control2Y = startY + Math.sin(angle - Math.PI/4) * (length * 0.66);
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;
            
            this.textureLines.push({
                startX, startY,
                control1X, control1Y,
                control2X, control2Y,
                endX, endY
            });
        }
    }
    
    update() {
        // Verifica se algum peixe quer sair da toca
        for (let i = this.occupants.length - 1; i >= 0; i--) {
            const occupant = this.occupants[i];
            
            // 1% de chance por frame de um peixe deixar a toca
            if (Math.random() < 0.01) {
                occupant.leaveHideout();
            }
        }
    }
    
    // Método para adicionar um peixe à toca
    addOccupant(fish) {
        if (this.occupants.length < this.capacity) {
            this.occupants.push(fish);
            return true; // Peixe adicionado com sucesso
        }
        return false; // Toca cheia
    }

    // Método para remover um peixe da toca
    removeOccupant(fish) {
        const index = this.occupants.indexOf(fish);
        if (index > -1) {
            this.occupants.splice(index, 1);
            return true; // Peixe removido com sucesso
        }
        return false; // Peixe não encontrado
    }

    // Método para verificar se a toca está cheia
    isFull() {
        return this.occupants.length >= this.capacity;
    }
    
    display() {
        const ctx = window._renderer.drawingContext;
        
        // Desenha a caverna/toca
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Desenha um círculo com uma abertura
        ctx.arc(this.position.x, this.position.y, this.size, 
                this.openingAngle - this.openingSize / 2, 
                this.openingAngle + this.openingSize / 2,
                true);
        
        // Fecha o caminho para formar uma caverna
        ctx.lineTo(this.position.x, this.position.y);
        ctx.closePath();
        ctx.fill();
        
        // Adiciona textura/detalhes à toca usando as linhas pré-calculadas
        ctx.strokeStyle = this.adjustColor(this.color, -30);
        ctx.lineWidth = 2;
        
        // Desenha as linhas de textura fixas
        for (const line of this.textureLines) {
            ctx.beginPath();
            ctx.moveTo(line.startX, line.startY);
            ctx.bezierCurveTo(
                line.control1X, line.control1Y,
                line.control2X, line.control2Y,
                line.endX, line.endY
            );
            ctx.stroke();
        }
        
        // Interior mais escuro
        ctx.fillStyle = this.adjustColor(this.color, -50);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.6, 
                this.openingAngle - this.openingSize / 3, 
                this.openingAngle + this.openingSize / 3,
                true);
        ctx.lineTo(this.position.x, this.position.y);
        ctx.closePath();
        ctx.fill();
    }
    
    // Ajusta a cor para mais clara ou mais escura
    adjustColor(color, amount) {
        // Converte cor hex para RGB
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        
        // Ajusta os valores
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        // Converte de volta para hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

export default Hideout;