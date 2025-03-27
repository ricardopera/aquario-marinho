import { clearAllThoughtBubbles } from './thoughtBubble.js';

// Função para limpar e resetar todas as bolhas existentes
export function resetAllBubbleStyles() {
    // Primeiro, remove todas as bolhas existentes
    clearAllThoughtBubbles();
    
    // Em seguida, define regras CSS dinâmicas para garantir que as próximas bolhas sigam o estilo correto
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        .thought-bubble {
            position: absolute !important;
            transform: translate(-50%, -100%) !important;
            left: var(--entity-x) !important;
            top: var(--entity-y) !important;
        }
        
        .thought-bubble::after {
            content: '' !important;
            position: absolute !important;
            bottom: -10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            border-top: 10px solid rgba(255, 255, 255, 0.9) !important;
            border-left: 10px solid transparent !important;
            border-right: 10px solid transparent !important;
        }
    `;
    
    document.head.appendChild(styleTag);
    
    return true;
}
