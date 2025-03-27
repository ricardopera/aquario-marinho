/**
 * Ferramenta de diagnóstico para detectar e corrigir problemas com as bolhas de pensamento
 */

export function debugBubblePositioning() {
    // Adiciona um indicador visual para mostrar onde as bolhas estão sendo posicionadas
    const createDebugPoint = (x, y, color = 'red') => {
        const point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.left = `${x}px`;
        point.style.top = `${y}px`;
        point.style.width = '10px';
        point.style.height = '10px';
        point.style.backgroundColor = color;
        point.style.borderRadius = '50%';
        point.style.zIndex = '10000';
        point.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(point);
        
        // Remove após 2 segundos
        setTimeout(() => point.remove(), 2000);
        return point;
    };
    
    // Analisa todas as bolhas existentes
    const bubbles = document.querySelectorAll('.thought-bubble');
    console.log(`Analisando ${bubbles.length} bolhas de pensamento...`);
    
    bubbles.forEach((bubble, index) => {
        // Pega o rect da bolha
        const rect = bubble.getBoundingClientRect();
        console.log(`Bolha ${index}:`, {
            left: bubble.style.left,
            top: bubble.style.top,
            transform: bubble.style.transform,
            rectLeft: rect.left,
            rectTop: rect.top
        });
        
        // Cria um ponto de debug onde a bolha está posicionada
        createDebugPoint(rect.left + rect.width/2, rect.top + rect.height/2, 'blue');
        
        // Verifica problema de posicionamento no canto inferior esquerdo
        if (rect.left < 20 && rect.top > window.innerHeight - 100) {
            console.log(`Bolha ${index} detectada no canto inferior esquerdo!`);
            createDebugPoint(rect.left, rect.top, 'red');
            
            // Tenta reposicionar a bolha ao centro da tela para testar
            bubble.style.left = `${window.innerWidth / 2}px`;
            bubble.style.top = `${window.innerHeight / 2}px`;
        }
    });
    
    // Cria uma bolha de teste no centro da tela
    console.log("Criando bolha de teste no centro da tela...");
    const testBubble = document.createElement('div');
    testBubble.className = 'debug-bubble';
    testBubble.innerText = 'Bolha de Diagnóstico';
    testBubble.style.position = 'absolute';
    testBubble.style.left = `${window.innerWidth / 2}px`;
    testBubble.style.top = `${window.innerHeight / 2}px`;
    testBubble.style.transform = 'translate(-50%, -100%)';
    testBubble.style.backgroundColor = 'green';
    testBubble.style.color = 'white';
    testBubble.style.padding = '10px';
    testBubble.style.borderRadius = '10px';
    testBubble.style.zIndex = '10001';
    document.body.appendChild(testBubble);
    
    // Remove após 3 segundos
    setTimeout(() => testBubble.remove(), 3000);
    
    return "Diagnóstico de bolhas concluído, verifique o console para detalhes";
}

// Exporta a função para uso via console
window.debugBubbles = debugBubblePositioning;
