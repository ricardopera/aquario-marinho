/**
 * Este módulo contém funções específicas para corrigir problemas com as bolhas de pensamento.
 */

// Função para corrigir bolhas problemáticas que podem aparecer no canto inferior
export function fixBrokenBubbles() {
    const bubbles = document.querySelectorAll('.thought-bubble');
    
    bubbles.forEach(bubble => {
        const rect = bubble.getBoundingClientRect();
        
        // Verifica se a bolha está no canto inferior esquerdo ou em posição inválida
        if ((rect.left < 20 && rect.top > window.innerHeight - 100) ||
            rect.left <= 0 || rect.top <= 0) {
            
            // Remove bolha incorretamente posicionada
            bubble.remove();
        }
    });
}

// Verifica se uma bolha está em uma posição válida
export function isBubbleValid(bubble) {
    if (!bubble) return false;
    
    const rect = bubble.getBoundingClientRect();
    
    // Uma bolha é válida se:
    // 1. Está dentro da janela visível
    // 2. Não está no canto inferior esquerdo
    return rect.left > 0 && 
           rect.top > 0 && 
           rect.right < window.innerWidth &&
           rect.bottom < window.innerHeight &&
           !(rect.left < 20 && rect.top > window.innerHeight - 100);
}

// Função para iniciar verificação periódica de bolhas
export function startBubbleFixInterval() {
    // Verifica e corrige bolhas a cada segundo
    setInterval(fixBrokenBubbles, 1000);
}
