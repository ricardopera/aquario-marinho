import Fish from './fish.js';

export class CommunistFish extends Fish {
    constructor(x, y, size = 30) {
        // Corrigindo os parâmetros para seguir a ordem esperada pelo construtor de Fish
        super(x, y, size, "Peixe Comunista", '#FF0000', false);
        
        // Configurar aparência do peixe comunista (apenas cor vermelha)
        this.color = '#FF0000'; // Vermelho soviético
        
        // Velocidade normal, como outros peixes
        this.maxSpeed = 1.3;
        
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
    }
    
    // Sobrescreve apenas os métodos think e forceThink para usar pensamentos comunistas
    think(thought) {
        // Escolhe um pensamento comunista aleatório em vez do parâmetro recebido
        const randomIndex = Math.floor(Math.random() * this.communistThoughts.length);
        const communistThought = this.communistThoughts[randomIndex];
        
        // Usa o método da classe pai com o pensamento comunista
        return super.think(communistThought);
    }
    
    forceThink(thought) {
        // Escolhe um pensamento comunista aleatório em vez do parâmetro recebido
        const randomIndex = Math.floor(Math.random() * this.communistThoughts.length);
        const communistThought = this.communistThoughts[randomIndex];
        
        // Usa o método da classe pai com o pensamento comunista
        return super.forceThink(communistThought);
    }
}
