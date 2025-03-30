import Fish from './entities/fish.js';
import Coral from './entities/coral.js';
import Jellyfish from './entities/jellyfish.js';
import Hideout from './entities/hideout.js';
import Alga from './entities/alga.js';
import Bubble from './entities/bubble.js';
import { CommunistFish } from './entities/communistFish.js';
import { checkCollision, handleCollision, ParticleSystem } from './utils/collision.js';
import { createThoughtBubble, showFishThought, updateAllBubblePositions, clearAllThoughtBubbles, initThoughtBubbleSystem } from './utils/thoughtBubble.js';
import { addVectors, subtractVectors, normalize, multiplyVector } from './utils/vector.js';
import { resetAllBubbleStyles } from './utils/resetBubbles.js';
import { startBubbleFixInterval, fixBrokenBubbles } from './utils/bubbleFix.js';
import { debugBubblePositioning } from './utils/bubbleDebugger.js';
import { initUIController } from './utils/uiController.js';
import { initAudioController } from './utils/audioController.js';

// Variáveis globais
let canvas;
let ctx;
let fishes = [];
let corals = [];
let jellyfishes = [];
let hideouts = [];
let bubbles = [];
let algae = [];
let particles;
let isRunning = true;

// Configurações do aquário
const FISH_COUNT = 15;
const CORAL_COUNT = 8;
const JELLYFISH_COUNT = 5;
const HIDEOUT_COUNT = 3;
const ALGAE_COUNT = 20;
const BUBBLE_RATE = 0.1;

// Espécies de peixes disponíveis
const FISH_SPECIES = [
    { name: "Peixe-palhaço", color: "#FF7F00", predator: false, minSize: 15, maxSize: 25 },
    { name: "Cirurgião-azul", color: "#1E90FF", predator: false, minSize: 20, maxSize: 30 },
    { name: "Peixe-borboleta", color: "#FFD700", predator: false, minSize: 15, maxSize: 25 },
    { name: "Peixe-anjo", color: "#9370DB", predator: false, minSize: 20, maxSize: 35 },
    { name: "Barracuda", color: "#708090", predator: true, minSize: 30, maxSize: 45 },
    { name: "Tubarão-recife", color: "#A9A9A9", predator: true, minSize: 40, maxSize: 60 },
    { name: "Peixe-leão", color: "#B22222", predator: true, minSize: 25, maxSize: 40 }
];

// Função principal de inicialização
function init() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    
    // Captura a referência do contexto para o p5.js
    window._renderer = { drawingContext: ctx };
    
    // Inicializa o sistema de partículas
    particles = new ParticleSystem();
    
    initializeEntities();
    setupControls();
    animate();
    
    // Adiciona eventos de redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Adiciona evento de clique para interatividade
    canvas.addEventListener('click', handleClick);
    
    // Reseta todas as bolhas para garantir o posicionamento correto
    resetAllBubbleStyles();
}

// Inicializa todas as entidades do aquário
function initializeEntities() {
    // Cria algas
    for (let i = 0; i < ALGAE_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - Math.random() * 50;
        const height = 50 + Math.random() * 100;
        const segments = Math.floor(Math.random() * 5) + 3;
        
        algae.push(new Alga(x, y, height, segments));
    }
    
    // Cria corais
    for (let i = 0; i < CORAL_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - Math.random() * (canvas.height / 3); // Corais ficam mais no fundo
        const size = 20 + Math.random() * 30;
        corals.push(new Coral(x, y, size));
    }
    
    // Cria tocas
    for (let i = 0; i < HIDEOUT_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - Math.random() * (canvas.height / 2);
        const size = 40 + Math.random() * 30;
        hideouts.push(new Hideout(x, y, size));
    }
    
    // Cria águas-vivas
    for (let i = 0; i < JELLYFISH_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height / 2); // Águas-vivas ficam mais no topo
        const size = 15 + Math.random() * 20;
        jellyfishes.push(new Jellyfish(x, y, size));
    }
    
    // Cria peixes
    for (let i = 0; i < FISH_COUNT; i++) {
        const species = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = species.minSize + Math.random() * (species.maxSize - species.minSize);
        fishes.push(new Fish(x, y, size, species.name, species.color, species.predator));
    }

    // Cria algumas bolhas iniciais
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - Math.random() * (canvas.height / 2);
        bubbles.push(new Bubble(x, y));
    }
}

// Configura os botões de controle da UI
function setupControls() {
    const addFishBtn = document.getElementById('addFish');
    const addCoralBtn = document.getElementById('addCoral');
    const togglePauseBtn = document.getElementById('togglePause');
    
    if (addFishBtn) {
        addFishBtn.addEventListener('click', () => {
            const species = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = species.minSize + Math.random() * (species.maxSize - species.minSize);
            fishes.push(new Fish(x, y, size, species.name, species.color, species.predator));
        });
    }
    
    if (addCoralBtn) {
        addCoralBtn.addEventListener('click', () => {
            const x = Math.random() * canvas.width;
            const y = canvas.height - Math.random() * (canvas.height / 3);
            const size = 20 + Math.random() * 30;
            corals.push(new Coral(x, y, size));
        });
    }
    
    if (togglePauseBtn) {
        togglePauseBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            togglePauseBtn.textContent = isRunning ? "Pausar" : "Continuar";
            
            if (isRunning) animate();
        });
    }
}

// Loop principal de animação
function animate() {
    if (!isRunning) return;
    
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha o fundo do aquário
    drawBackground();
    
    // Atualiza e renderiza todas as entidades
    updateEntities();
    
    // Adiciona bolhas ocasionalmente
    if (Math.random() < BUBBLE_RATE) {
        addBubble();
    }
    
    // Atualiza e renderiza o sistema de partículas
    particles.update();
    particles.display(ctx);
    
    // Atualiza a posição das bolhas de pensamento (CERTIFICA-SE QUE É CHAMADO A CADA FRAME)
    updateAllBubblePositions();
    
    // Continua o loop de animação
    requestAnimationFrame(animate);
}

// Desenha o fundo gradiente do aquário
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0077BE'); // Azul mais claro no topo
    gradient.addColorStop(1, '#004080'); // Azul mais escuro no fundo
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenha raios de luz vindos da superfície
    drawLightRays();
    
    // Desenha o fundo de areia
    drawSandyBottom();
}

// Desenha raios de luz vindos da superfície
function drawLightRays() {
    ctx.save();
    
    // Configura alpha blending
    ctx.globalAlpha = 0.1;
    
    // Reduzindo ainda mais a velocidade da animação dos raios de luz
    const time = Date.now() * 0.00005; // Reduzido de 0.0001 para 0.00005
    
    // Usamos valores fixos para os raios de luz para evitar piscar
    for (let i = 0; i < 5; i++) {
        // Posicionamento fixo para cada raio, com oscilação muito lenta
        const baseX = (canvas.width / 6) * (i + 1);
        const x = baseX + Math.sin(time + i * 0.5) * 20; // Oscilação reduzida de 50 para 20
        const width = 70 + Math.sin(time * 0.5 + i) * 10; // Largura mais estável
        
        const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + width, canvas.height);
        ctx.lineTo(x - width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// Desenha o fundo de areia
function drawSandyBottom() {
    const sandHeight = 20;
    
    // Gradiente de areia
    const gradient = ctx.createLinearGradient(0, canvas.height - sandHeight, 0, canvas.height);
    gradient.addColorStop(0, '#D2B48C'); // Areia mais clara no topo
    gradient.addColorStop(1, '#C19A6B'); // Areia mais escura no fundo
    
    ctx.fillStyle = gradient;
    
    // Desenha um contorno ondulado para a areia
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    
    const segments = 20;
    const segmentWidth = canvas.width / segments;
    
    // Reduzindo ainda mais a velocidade da animação da areia
    const time = Date.now() * 0.00005; // Reduzido de 0.0002 para 0.00005
    
    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        // Animação de onda mais sutil e lenta
        const y = canvas.height - sandHeight + Math.sin(i * 0.5 + time * 0.1) * 2;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Adiciona pequenas pedras na areia - VERSÃO FIXA SEM ANIMAÇÃO
    // Use um seed fixo para garantir que as pedras não mudem a cada frame
    const seed = Math.floor(Date.now() / 60000); // Muda a cada minuto, não a cada frame
    const random = (i) => {
        // Função pseudo-aleatória determinística baseada no índice
        return Math.abs((Math.sin(i * 9999 + seed) * 10000) % 1); // Adicionado Math.abs para garantir valores positivos
    };
    
    // Desenha pedras fixas
    for (let i = 0; i < 20; i++) {
        const x = random(i * 3) * canvas.width;
        const y = canvas.height - random(i * 3 + 1) * sandHeight * 0.8;
        const size = 1 + random(i * 3 + 2) * 3; // Garante tamanho positivo entre 1-4
        
        // Cor levemente variada mas constante para cada pedra
        const r = 100 + random(i) * 50;
        const g = 70 + random(i + 0.1) * 40;
        const b = 50 + random(i + 0.2) * 30;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Adiciona uma nova bolha
function addBubble() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    bubbles.push(new Bubble(x, y));
}

// Atualiza todas as entidades
function updateEntities() {
    // Filtra entidades mortas
    algae = algae.filter(alga => alga.isAlive());
    corals = corals.filter(coral => coral.isAlive());
    jellyfishes = jellyfishes.filter(jellyfish => jellyfish.isAlive());
    bubbles = bubbles.filter(bubble => bubble.isAlive());
    fishes = fishes.filter(fish => fish.isAlive());
    
    // Atualiza algas
    for (const alga of algae) {
        alga.update();
        alga.display();
    }
    
    // Atualiza corais
    for (const coral of corals) {
        coral.update();
        coral.display();
    }
    
    // Atualiza tocas
    for (const hideout of hideouts) {
        hideout.update();
        hideout.display();
    }
    
    // Atualiza bolhas
    for (const bubble of bubbles) {
        bubble.update();
        bubble.display();
        
        // Verifica colisões de bolhas com peixes
        for (const fish of fishes) {
            if (checkCollision(bubble, fish)) {
                bubble.pop();
                particles.addParticle(bubble.position.x, bubble.position.y, 'rgba(255, 255, 255, 0.7)', 8);
                break;
            }
        }
    }
    
    // Atualiza águas-vivas
    for (const jellyfish of jellyfishes) {
        jellyfish.update();
        jellyfish.display();
        
        // Chance extremamente baixa de mostrar pensamento
        if (Math.random() < 0.00005) { // Reduzida ainda mais
            showFishThought(jellyfish);
        }
    }
    
    // Atualiza peixes
    for (const fish of fishes) {
        // Atualiza o peixe passando todas as entidades necessárias
        fish.update(fishes, corals, jellyfishes, hideouts, algae);
        fish.display();
        
        // Adiciona chance de pensamento espontâneo
        if (Math.random() < 0.0005) { // Pequena chance a cada frame
            const thoughts = fish.isPredator ? 
                ["Hmm, quem será minha próxima refeição?", "Sou o rei deste aquário!", "Estou de olho em presas distraídas..."] :
                ["Que água agradável hoje!", "Estou apenas nadando por aí!", "Adoro este aquário colorido!"];
                
            const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
            fish.think(thought);
        }
        
        // Verifica colisões com outros peixes (para predadores)
        if (fish.isPredator) {
            for (const otherFish of fishes) {
                if (otherFish !== fish && !otherFish.isPredator && checkCollision(fish, otherFish)) {
                    if (fish.eat) {
                        fish.eat(otherFish);
                        particles.addParticle(otherFish.position.x, otherFish.position.y, otherFish.color, 15);
                    }
                }
            }
        }
    }
}

// Manipula o redimensionamento da janela
function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Limpa bolhas de pensamento ao redimensionar
    clearAllThoughtBubbles();
}

// Manipula cliques do usuário
function handleClick(event) {
    const x = event.clientX;
    const y = event.clientY;
    
    // Verifica se clicou em algum peixe
    for (const fish of fishes) {
        if (!fish.isAlive()) continue;
        
        const dx = fish.position.x - x;
        const dy = fish.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < fish.size) {
            // Mostra pensamento ao clicar no peixe - sempre centralizado acima do peixe
            const thoughts = fish.isPredator ? 
                ["Grr! Me deixe caçar em paz!", "Sou o rei deste aquário!", "Estou procurando minha próxima refeição..."] :
                ["Olá! Obrigado por me visitar!", "Estou apenas nadando por aí!", "Espero que esteja gostando do aquário!"];
                
            const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
            
            // Força um pensamento imediato, ignorando cooldowns
            fish.forceThink(thought);
            return;
        }
    }
    
    // Se não clicou em nenhum peixe, adiciona bolhas no local do clique
    for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        bubbles.push(new Bubble(x + offsetX, y + offsetY));
    }
}

// Iniciar função de limpeza periódica de bolhas órfãs
function startBubbleCleanupInterval() {
    // A cada 30 segundos, limpa bolhas órfãs
    setInterval(() => {
        // Aqui estamos chamando uma função do módulo thoughtBubble.js
        // em vez de uma indefinida cleanupOrphanedBubbles
        clearAllThoughtBubbles();
    }, 30000);
}

// Inicia a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado, iniciando aplicação...");
    
    // Inicializa o sistema de bolhas de pensamento PRIMEIRO
    initThoughtBubbleSystem();
    
    // Inicializa o controlador de UI
    initUIController();
    
    // Inicializa o controlador de áudio
    initAudioController();
    
    // Inicializa o resto da aplicação
    init();
    
    // Adiciona teste automático de bolhas após 2 segundos
    setTimeout(() => {
        console.log("Executando teste automático de bolhas");
        
        if (fishes.length > 0) {
            // Faz o primeiro peixe pensar algo
            const testFish = fishes[0];
            testFish.forceThink("TESTE! Você consegue me ver?");
            
            // Depois de 1 segundo, testa mais um peixe
            setTimeout(() => {
                if (fishes.length > 1) {
                    const secondFish = fishes[1];
                    secondFish.forceThink("Eu também estou testando as bolhas!");
                }
            }, 1000);
        } else {
            console.log("Não há peixes para testar bolhas");
        }
    }, 2000);
    
    // Força um teste periódico a cada 10 segundos
    setInterval(() => {
        if (fishes.length > 0) {
            // Escolhe um peixe aleatório para pensar
            const randomFish = fishes[Math.floor(Math.random() * fishes.length)];
            randomFish.forceThink("Teste periódico das bolhas...");
        }
    }, 10000);
    
    // Força a limpeza de bolhas existentes
    clearAllThoughtBubbles();
    
    // Adiciona um teste automático de bolhas de pensamento
    setTimeout(() => {
        console.log("Executando teste automático de bolhas");
        if (fishes.length > 0) {
            const testFish = fishes[0];
            const testBubble = testFish.forceThink("TESTE! Você consegue ver esta bolha?");
            console.log("Bolha de teste criada:", testBubble);
        } else {
            console.log("Não há peixes para testar a bolha");
        }
    }, 2000);
    
    // Adiciona verificações periódicas para remover bolhas problemáticas
    setInterval(() => {
        document.querySelectorAll('.thought-bubble, .basic-thought-bubble').forEach(bubble => {
            const rect = bubble.getBoundingClientRect();
            if (rect.left < 20 && rect.top > window.innerHeight - 50) {
                console.log("Removendo bolha problemática");
                bubble.remove();
            }
        });
    }, 3000);
    
    // Adiciona o peixe comunista após carregar tudo
    setTimeout(() => {
        try {
            if (!window.environment || !window.environment.communistFish) {
                console.log("Inicializando peixe comunista manualmente...");
                
                const communistFish = new CommunistFish(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    30
                );
                
                fishes.push(communistFish);
                
                window.environment = window.environment || {};
                window.environment.communistFish = communistFish;
                
                communistFish.appear();
                console.log("Peixe comunista inicializado com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao inicializar peixe comunista:", e);
        }
    }, 2000);
});

// Funções de utilidade para a API p5.js (versão simplificada)
window.random = function(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min);
};

window.createVector = function(x, y) {
    return { x, y };
};

window.p5 = {
    Vector: {
        sub: function(v1, v2) {
            return { x: v1.x - v2.x, y: v2.y - v2.y };
        }
    }
};

// Expõe algumas funções globalmente para a interface do usuário
window.aquariumAPI = {
    addFish: function(x, y, species) {
        const speciesInfo = species ? 
            FISH_SPECIES.find(s => s.name === species) : 
            FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
            
        if (!speciesInfo) return;
        
        const size = speciesInfo.minSize + Math.random() * (speciesInfo.maxSize - speciesInfo.minSize);
        const fish = new Fish(
            x || Math.random() * canvas.width,
            y || Math.random() * canvas.height,
            size,
            speciesInfo.name,
            speciesInfo.color,
            speciesInfo.predator
        );
        
        fishes.push(fish);
        return fish;
    },
    
    togglePause: function() {
        isRunning = !isRunning;
        if (isRunning) animate();
        return isRunning;
    },
    
    getSpeciesList: function() {
        return FISH_SPECIES.map(s => s.name);
    }
};