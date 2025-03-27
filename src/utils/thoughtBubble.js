/**
 * Sistema SUPER SIMPLIFICADO para bolhas de pensamento
 */

// Rastreador global de bolhas
let activeBubbles = [];

// Limpa todas as bolhas
function clearAllThoughtBubbles() {
    // Remove todas as bolhas do DOM
    document.querySelectorAll('.fish-thought').forEach(b => b.remove());
    
    // Limpa o array de bolhas
    activeBubbles = [];
    
    console.log('Todas as bolhas foram removidas');
}

// Cria uma bolha de pensamento (versão ultra simplificada)
function createThoughtBubble(text, x, y, entity, force = false) {
    // Se não temos texto ou entidade, sair
    if (!text || !entity || !entity.position) {
        console.log('Tentativa de criar bolha sem texto ou entidade válida');
        return null;
    }
    
    console.log('Criando bolha para:', text);
    console.log('Posição da entidade:', entity.position.x, entity.position.y);
    
    // Remove bolha existente para essa entidade
    const existingIndex = activeBubbles.findIndex(b => b.entity === entity);
    if (existingIndex >= 0) {
        const bubble = activeBubbles[existingIndex].element;
        if (bubble && bubble.parentNode) {
            bubble.remove();
        }
        activeBubbles.splice(existingIndex, 1);
    }
    
    // Cria um elemento DIV para a bolha
    const bubble = document.createElement('div');
    
    // IMPORTANTE: Usa uma classe diferente para evitar conflitos de CSS
    bubble.className = 'fish-thought';
    
    // Define o texto da bolha
    bubble.textContent = text;
    
    // Aplica estilos DIRETAMENTE como inline styles (sem depender de CSS)
    const styles = {
        position: 'absolute',
        left: (entity.position.x) + 'px',
        top: (entity.position.y - entity.size * 3) + 'px',
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'white',
        color: 'black',
        border: '2px solid black',
        borderRadius: '10px',
        padding: '8px',
        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        zIndex: '9999',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        maxWidth: '150px',
        minWidth: '100px',
        textAlign: 'center',
        pointerEvents: 'none' // Não interfere em cliques
    };
    
    // Aplicar cada estilo diretamente ao elemento
    Object.keys(styles).forEach(property => {
        bubble.style[property] = styles[property];
    });
    
    // Cria um elemento para a "cauda" da bolha
    const tail = document.createElement('div');
    const tailStyles = {
        position: 'absolute',
        left: '50%',
        bottom: '-10px',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid white'
    };
    
    // Aplica estilos à cauda
    Object.keys(tailStyles).forEach(property => {
        tail.style[property] = tailStyles[property];
    });
    
    // Adiciona a cauda à bolha
    bubble.appendChild(tail);
    
    // IMPORTANTE: Adiciona a bolha diretamente ao body
    document.body.appendChild(bubble);
    
    // Verifica se a bolha realmente apareceu e está visível
    const rect = bubble.getBoundingClientRect();
    console.log('Bolha criada com tamanho:', rect.width, 'x', rect.height);
    console.log('Posição da bolha:', rect.left, rect.top);
    
    // Adiciona ao array de bolhas ativas
    activeBubbles.push({
        element: bubble,
        entity: entity
    });
    
    // Auto-remove após 3 segundos
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
            
            // Remove do array de bolhas ativas
            const index = activeBubbles.findIndex(b => b.element === bubble);
            if (index >= 0) {
                activeBubbles.splice(index, 1);
            }
        }
    }, 3000);
    
    return bubble;
}

// Atualiza a posição das bolhas a cada frame
function updateAllBubblePositions() {
    for (let i = activeBubbles.length - 1; i >= 0; i--) {
        const { element, entity } = activeBubbles[i];
        
        // Se a entidade ou elemento não existem mais, remover do array
        if (!entity || !entity.position || !element || !element.parentNode) {
            if (element && element.parentNode) {
                element.remove();
            }
            activeBubbles.splice(i, 1);
            continue;
        }
        
        // Atualiza a posição
        element.style.left = entity.position.x + 'px';
        element.style.top = (entity.position.y - entity.size * 3) + 'px';
    }
}

// Mostra um pensamento para um peixe específico
function showFishThought(fish) {
    if (!fish) return null;
    
    const thoughts = [
        "Glub glub...",
        "Nadando por aí...",
        "Que água boa!",
        "Estou com fome..."
    ];
    
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    return createThoughtBubble(randomThought, 0, 0, fish);
}

// Inicializa o sistema de bolhas
function initThoughtBubbleSystem() {
    console.log('Inicializando sistema de bolhas de pensamento');
    
    // Limpa todas as bolhas antigas
    clearAllThoughtBubbles();
    
    // Cria uma bolha de teste no meio da tela para verificar se o sistema funciona
    const testBubble = document.createElement('div');
    testBubble.className = 'system-test-bubble';
    testBubble.textContent = 'TESTE DO SISTEMA DE BOLHAS';
    
    const testStyles = {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'red',
        color: 'white',
        fontWeight: 'bold',
        padding: '15px',
        borderRadius: '10px',
        zIndex: '10000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        border: '3px solid black',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    };
    
    Object.keys(testStyles).forEach(property => {
        testBubble.style[property] = testStyles[property];
    });
    
    document.body.appendChild(testBubble);
    
    console.log('Bolha de teste criada no centro da tela');
    
    // Remove a bolha de teste após 3 segundos
    setTimeout(() => {
        if (testBubble.parentNode) {
            testBubble.remove();
            console.log('Bolha de teste removida');
        }
    }, 3000);
}

// Exportar as funções
export {
    createThoughtBubble,
    showFishThought,
    updateAllBubblePositions,
    clearAllThoughtBubbles,
    initThoughtBubbleSystem
};