// Importação usando caminho relativo completo para evitar referência circular
import Fish from './fish.js';

export class CommunistFish extends Fish {
    constructor(x, y, size = 30) {
        // Create a species data object for the communist fish
        const communistSpeciesData = {
            name: "Peixe Comunista",
            color: '#FF0000', // Vermelho soviético
            predator: false,
            minSize: 28,
            maxSize: 32,
            // Características específicas do peixe comunista
            depthPreference: 0.5, // Nada em todas as profundidades (igualitário)
            schoolingTendency: 0.9, // Alta tendência coletivista
            territorialLevel: 0.1, // Baixa territorialidade (propriedade é roubo!)
            activityLevel: 0.7, // Ativo na revolução
            cruisingSpeed: 1.0,
            burstSpeed: 1.5,
            shyness: 0.2 // Corajoso na luta de classes
        };
        
        // Corrigindo os parâmetros para seguir a ordem esperada pelo construtor de Fish
        super(x, y, size, communistSpeciesData);
        
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
    
    die() {
        // Antes de morrer, mostrar um pensamento final dramático
        this.forceThink("O comunismo jamais morrerá, camarada!");
        
        // Chama o método original de morte
        super.die();
    }
}
