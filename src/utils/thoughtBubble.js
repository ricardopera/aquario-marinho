/**
 * Sistema OTIMIZADO para bolhas de pensamento - Fase 1 Refatoração
 */

class ThoughtBubbleManager {
    constructor() {
        this.activeBubbles = new Map(); // Usar Map para O(1) access
        this.bubblePool = []; // Pool de objetos para reutilização
        this.maxBubbles = 10; // Limite para evitar spam
        this.lastCleanup = 0;
        this.cleanupInterval = 5000; // 5 segundos
    }

    isValidRequest(entity, text) {
        return entity && 
               entity.position && 
               text && 
               text.trim().length > 0 &&
               entity.alive !== false &&
               entity.position.x >= 0 && 
               entity.position.y >= 0;
    }

    createBubble(entity, text) {
        // VALIDAÇÃO PRECOCE - evitar processamento desnecessário
        if (!this.isValidRequest(entity, text)) {
            return null; // SEM LOGGING para casos inválidos
        }

        // Verificar limites
        if (this.activeBubbles.size >= this.maxBubbles) {
            this.removeOldestBubble();
        }

        // Reutilizar objeto do pool ou criar novo
        let bubble = this.bubblePool.pop();
        if (!bubble) {
            bubble = this.createBubbleElement();
        }
        
        this.initializeBubble(bubble, entity, text);
        this.activeBubbles.set(entity.id || entity, bubble);
        
        return bubble.element;
    }

    createBubbleElement() {
        const element = document.createElement('div');
        element.className = 'fish-thought';
        
        const tail = document.createElement('div');
        tail.className = 'bubble-tail';
        element.appendChild(tail);
        
        return {
            element: element,
            tail: tail,
            entityId: null,
            createdAt: 0
        };
    }

    initializeBubble(bubble, entity, text) {
        bubble.element.textContent = text;
        bubble.entityId = entity.id || entity;
        bubble.createdAt = Date.now();
        
        // Estilos aplicados diretamente
        this.applyBubbleStyles(bubble.element, entity);
        
        document.body.appendChild(bubble.element);
        
        // Auto-remove após 3 segundos
        setTimeout(() => {
            this.removeBubble(entity.id || entity);
        }, 3000);
    }

    applyBubbleStyles(element, entity) {
        const styles = {
            position: 'absolute',
            left: entity.position.x + 'px',
            top: (entity.position.y - (entity.size * 3 || 50)) + 'px',
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
            pointerEvents: 'none'
        };
        
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
        
        // Estilos da cauda - verificar se existe
        const tail = element.querySelector('.bubble-tail');
        if (tail) {
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
            
            Object.keys(tailStyles).forEach(property => {
                tail.style[property] = tailStyles[property];
            });
        }
    }

    updateBubblePositions() {
        const now = Date.now();
        
        // Cleanup periódico para evitar vazamentos de memória
        if (now - this.lastCleanup > this.cleanupInterval) {
            this.cleanup();
            this.lastCleanup = now;
        }
        
        // Atualizar posições apenas se há bolhas ativas
        if (this.activeBubbles.size === 0) return;
        
        for (const [entityId, bubble] of this.activeBubbles) {
            const entity = this.findEntityById(entityId);
            
            if (!entity || !entity.position || !bubble.element.parentNode) {
                this.removeBubble(entityId);
                continue;
            }
            
            // Atualizar posição suavemente
            bubble.element.style.left = entity.position.x + 'px';
            bubble.element.style.top = (entity.position.y - (entity.size * 3 || 50)) + 'px';
        }
    }

    findEntityById(entityId) {
        // Aqui você precisaria implementar uma forma de encontrar entidades por ID
        // Por enquanto, retornamos null para entidades não encontradas
        return null;
    }

    removeBubble(entityId) {
        const bubble = this.activeBubbles.get(entityId);
        if (bubble) {
            if (bubble.element.parentNode) {
                bubble.element.remove();
            }
            this.activeBubbles.delete(entityId);
            
            // Retornar ao pool para reutilização
            this.bubblePool.push(bubble);
        }
    }

    removeOldestBubble() {
        const oldest = [...this.activeBubbles.entries()].reduce((oldest, [entityId, bubble]) => {
            return !oldest || bubble.createdAt < oldest[1].createdAt ? [entityId, bubble] : oldest;
        }, null);
        
        if (oldest) {
            this.removeBubble(oldest[0]);
        }
    }

    cleanup() {
        // Remove bolhas órfãs e limita o pool
        const toRemove = [];
        for (const [entityId, bubble] of this.activeBubbles) {
            if (!bubble.element.parentNode) {
                toRemove.push(entityId);
            }
        }
        toRemove.forEach(id => this.activeBubbles.delete(id));
        
        // Limitar pool de objetos
        if (this.bubblePool.length > 20) {
            this.bubblePool = this.bubblePool.slice(0, 20);
        }
    }

    clearAll() {
        document.querySelectorAll('.fish-thought').forEach(b => b.remove());
        this.activeBubbles.clear();
        this.bubblePool = [];
    }
}

// Instância global do gerenciador
const bubbleManager = new ThoughtBubbleManager();

// Funções de compatibilidade com o código existente
function clearAllThoughtBubbles() {
    bubbleManager.clearAll();
}

function createThoughtBubble(text, x, y, entity, force = false) {
    // Lidar com diferentes assinaturas de função
    if (typeof text === 'object' && typeof x === 'string') {
        // Chamada estilo: createThoughtBubble(entity, text)
        return bubbleManager.createBubble(text, x);
    }
    
    return bubbleManager.createBubble(entity, text);
}


// Atualiza a posição das bolhas a cada frame - OTIMIZADO
function updateAllBubblePositions() {
    bubbleManager.updateBubblePositions();
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

// Inicializa o sistema de bolhas - SIMPLIFICADO
function initThoughtBubbleSystem() {
    // Limpa todas as bolhas antigas
    clearAllThoughtBubbles();
    
    // Sistema inicializado - sem bolha de teste para evitar poluição visual
}

// Exportar as funções
export {
    createThoughtBubble,
    showFishThought,
    updateAllBubblePositions,
    clearAllThoughtBubbles,
    initThoughtBubbleSystem
};