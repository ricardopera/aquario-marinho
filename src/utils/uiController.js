/**
 * Controla a visibilidade da interface do usuário
 */

let uiTimer = null;
const UI_TIMEOUT = 5000; // Tempo em ms para a UI desaparecer

export function initUIController() {
    const controls = document.querySelector('.ui-controls');
    
    // Cria a área de ativação no canto superior direito
    const triggerArea = document.createElement('div');
    triggerArea.className = 'ui-trigger-area';
    document.body.appendChild(triggerArea);
    
    // Mostra a UI quando o mouse entra na área de gatilho
    triggerArea.addEventListener('mouseenter', () => {
        showUI(controls);
    });
    
    // Também mostra quando o mouse entra na própria UI
    controls.addEventListener('mouseenter', () => {
        showUI(controls);
    });
    
    // Reinicia o temporizador de esconder quando o mouse se move dentro da UI
    controls.addEventListener('mousemove', () => {
        showUI(controls);
    });
    
    // Esconde a UI quando o mouse sai da UI (com delay)
    controls.addEventListener('mouseleave', () => {
        startUIHideTimer(controls);
    });
    
    // Inicialmente esconde a UI
    controls.classList.remove('visible');
}

function showUI(controls) {
    // Limpa qualquer temporizador existente
    if (uiTimer) {
        clearTimeout(uiTimer);
        uiTimer = null;
    }
    
    // Mostra a UI
    controls.classList.add('visible');
    
    // Inicia o temporizador para esconder a UI
    startUIHideTimer(controls);
}

function startUIHideTimer(controls) {
    // Limpa qualquer temporizador existente
    if (uiTimer) {
        clearTimeout(uiTimer);
    }
    
    // Define um novo temporizador
    uiTimer = setTimeout(() => {
        controls.classList.remove('visible');
    }, UI_TIMEOUT);
}
