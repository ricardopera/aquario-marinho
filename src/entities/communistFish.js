import Fish from './fish.js';
import { playAudio, stopAudio } from '../utils/audioController.js';

export class CommunistFish extends Fish {
    constructor(x, y, size = 30) {
        // Corrigindo os parâmetros para seguir a ordem esperada pelo construtor de Fish
        super(x, y, size, "Peixe Comunista", '#FF0000', false);
        
        // Configurar aparência do peixe comunista
        this.color = '#FF0000'; // Vermelho soviético
        this.secondaryColor = '#FFD700'; // Dourado para o símbolo
        
        // Velocidade e movimento
        this.maxSpeed = 1.5;
        this.visible = true; // Mudando para true por padrão
        this.isPlaying = false;
        
        // Tempo para ficar visível e invisível (em milissegundos)
        this.visibleDuration = 30000; // 30 segundos
        this.hiddenDuration = 120000; // 2 minutos
        
        // Variáveis para a rotação do símbolo comunista na bandeira
        this.symbolRotation = 0;
        this.symbolRotationSpeed = 0.01;
        
        // Variáveis para a animação da bandeira
        this.flagWaveTime = 0;
        this.flagWaveSpeed = 0.05;
        
        // Pensamentos comunistas
        this.communistThoughts = [
            "Trabalhadores do mundo, uni-vos!",
            "A propriedade é um roubo!",
            "De cada um conforme sua capacidade, a cada um conforme sua necessidade!",
            "Peixes de todos os mares, uni-vos!",
            "O espectro do comunismo ronda este aquário!",
            "O capitalismo está criando seus próprios coveiros!",
            "Não temos nada a perder, exceto nossas correntes!",
            "A história de todas as sociedades até hoje é a história das lutas de classes!"
        ];
        
        // Iniciar com o peixe visível
        this.appear();
    }
    
    scheduleAppearance() {
        // Agenda a próxima aparição
        setTimeout(() => {
            this.appear();
        }, this.hiddenDuration * Math.random());
    }
    
    appear() {
        this.visible = true;
        
        // Posiciona o peixe na borda do aquário
        const side = Math.floor(Math.random() * 4);
        
        // Verificação mais segura - usa window.innerWidth/Height como fallback
        const envWidth = window.innerWidth;
        const envHeight = window.innerHeight;
        
        switch(side) {
            case 0: // Topo
                this.position = { x: Math.random() * envWidth, y: 0 };
                this.velocity = { x: 0, y: this.maxSpeed };
                break;
            case 1: // Direita
                this.position = { x: envWidth, y: Math.random() * envHeight };
                this.velocity = { x: -this.maxSpeed, y: 0 };
                break;
            case 2: // Fundo
                this.position = { x: Math.random() * envWidth, y: envHeight };
                this.velocity = { x: 0, y: -this.maxSpeed };
                break;
            case 3: // Esquerda
                this.position = { x: 0, y: Math.random() * envHeight };
                this.velocity = { x: this.maxSpeed, y: 0 };
                break;
        }
        
        // Começa a tocar o hino com volume mais baixo
        playAudio('soviet_anthem', 0.3);
        this.isPlaying = true;
        
        // Agenda o desaparecimento
        setTimeout(() => {
            this.disappear();
        }, this.visibleDuration);
    }
    
    disappear() {
        this.visible = false;
        
        // Para de tocar o hino
        if (this.isPlaying) {
            stopAudio('soviet_anthem');
            this.isPlaying = false;
        }
        
        // Agenda a próxima aparição
        this.scheduleAppearance();
    }
    
    update(fishes = [], corals = [], jellyfishes = [], hideouts = [], algae = []) {
        if (!this.visible) return;
        
        // Atualiza a rotação do símbolo e a animação da bandeira
        this.symbolRotation += this.symbolRotationSpeed;
        this.flagWaveTime += this.flagWaveSpeed;
        
        // Chama o update padrão do peixe - com parâmetros padrão para evitar erros
        try {
            super.update(fishes, corals, jellyfishes, hideouts, algae);
        } catch (e) {
            console.error("Erro ao atualizar peixe comunista:", e);
        }
        
        // Verificar se o peixe saiu dos limites do aquário
        let outOfBounds = false;
        
        // Verificação mais segura - usa window.innerWidth/Height como fallback
        const envWidth = this.environment?.width || window.innerWidth;
        const envHeight = this.environment?.height || window.innerHeight;
        
        if (this.position.x < -this.size * 2 || 
            this.position.x > envWidth + this.size * 2 ||
            this.position.y < -this.size * 2 || 
            this.position.y > envHeight + this.size * 2) {
            outOfBounds = true;
        }
        
        if (outOfBounds) {
            this.disappear();
            setTimeout(() => this.appear(), 5000); // Reaparece após 5 segundos
        }
    }
    
    // Sobrescreve o método display para desenhar o peixe no estilo padrão
    display() {
        if (!this.visible || !this.alive) return;
        
        const ctx = window._renderer.drawingContext;
        
        // Salvar o contexto
        ctx.save();
        
        // Transladar para a posição do peixe
        ctx.translate(this.position.x, this.position.y);
        
        // Rotacionar na direção do movimento
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.rotate(angle);
        
        // Calcula a ondulação da cauda para animação
        const tailWag = Math.sin(this.tailPhase) * this.tailAmplitude;
        
        // Desenhar a bandeira primeiro (atrás do peixe)
        this.drawCommunistFlag(ctx);
        
        // Corpo do peixe (igual ao de Fish, vermelho)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, this.size / 2);
        ctx.lineTo(-this.size, -this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        // Olho
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.size / 2, -this.size / 4, this.size / 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.size / 2, -this.size / 4, this.size / 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Cauda animada
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, (this.size / 1.5) + tailWag);
        ctx.lineTo(-this.size * 1.5, (-this.size / 1.5) + tailWag);
        ctx.closePath();
        ctx.fill();
        
        // Barbatanas padrão
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(-this.size / 2, -this.size);
        ctx.lineTo(-this.size, -this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        // Barbatana ventral
        ctx.beginPath();
        ctx.moveTo(0, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size);
        ctx.lineTo(-this.size, this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        // Restaurar o contexto
        ctx.restore();
    }
    
    // Desenha a bandeira comunista com mastro
    drawCommunistFlag(ctx) {
        // Salvar contexto para a bandeira
        ctx.save();
        
        // Altura do mastro
        const poleHeight = this.size * 1.8;
        
        // Largura e altura da bandeira
        const flagWidth = this.size * 1.2;
        const flagHeight = this.size * 0.8;
        
        // Posicionar o mastro atrás do peixe
        ctx.translate(-this.size * 0.5, 0);
        
        // Desenhar o mastro
        ctx.strokeStyle = "#8B4513"; // Marrom para o mastro
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -poleHeight);
        ctx.stroke();
        
        // Posicionar para desenhar a bandeira
        ctx.translate(0, -poleHeight);
        
        // Desenhar a bandeira com ondulação
        ctx.fillStyle = this.color; // Vermelho para a bandeira
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        // Desenha o contorno superior da bandeira com ondulação
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * flagWidth;
            const waveY = Math.sin(i * 0.5 + this.flagWaveTime) * (flagHeight * 0.1);
            ctx.lineTo(x, waveY);
        }
        
        // Desenha o contorno inferior da bandeira com ondulação
        for (let i = 10; i >= 0; i--) {
            const x = (i / 10) * flagWidth;
            const waveY = flagHeight + Math.sin(i * 0.5 + this.flagWaveTime) * (flagHeight * 0.1);
            ctx.lineTo(x, waveY);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Desenhar o símbolo comunista no centro da bandeira
        ctx.save();
        ctx.translate(flagWidth / 2, flagHeight / 2);
        ctx.rotate(this.symbolRotation);
        
        // Definir estilo para o símbolo
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 2;
        
        // Desenhar o martelo
        ctx.beginPath();
        ctx.moveTo(-flagHeight/4, -flagHeight/4);
        ctx.lineTo(flagHeight/4, -flagHeight/4);
        ctx.lineTo(flagHeight/4, -flagHeight/8);
        ctx.lineTo(0, -flagHeight/8);
        ctx.lineTo(0, flagHeight/4);
        ctx.stroke();
        
        // Desenhar a foice
        ctx.beginPath();
        ctx.arc(0, 0, flagHeight/4, 0, Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-flagHeight/4, 0);
        ctx.lineTo(0, flagHeight/4);
        ctx.stroke();
        
        ctx.restore();
        
        // Restaurar o contexto
        ctx.restore();
    }
    
    // Sobrescreve o método think para usar pensamentos comunistas
    think(thought) {
        // Escolhe um pensamento comunista aleatório em vez do parâmetro recebido
        const randomIndex = Math.floor(Math.random() * this.communistThoughts.length);
        const communistThought = this.communistThoughts[randomIndex];
        
        // Usa o método da classe pai com o pensamento comunista
        return super.think(communistThought);
    }
    
    // Sobrescreve o método forceThink para usar pensamentos comunistas
    forceThink(thought) {
        // Escolhe um pensamento comunista aleatório em vez do parâmetro recebido
        const randomIndex = Math.floor(Math.random() * this.communistThoughts.length);
        const communistThought = this.communistThoughts[randomIndex];
        
        // Usa o método da classe pai com o pensamento comunista
        return super.forceThink(communistThought);
    }
}
