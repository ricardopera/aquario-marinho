/**
 * Controla a visibilidade da interface do usuário
 */

import { CommunistFish } from '../entities/communistFish.js';

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
    
    // Adiciona um botão para forçar a aparição do peixe comunista (para testes)
    addCommunistFishButton(controls);
}

// Adiciona um botão para fazer o peixe comunista aparecer
function addCommunistFishButton(controls) {
    const communistButton = document.createElement('button');
    communistButton.className = 'communist-button';
    communistButton.innerHTML = '☭';
    communistButton.style.backgroundColor = '#FF0000';
    communistButton.style.color = '#FFD700';
    communistButton.style.fontWeight = 'bold';
    communistButton.style.fontSize = '20px';
    communistButton.title = 'Invocar camarada peixe';
    
    communistButton.addEventListener('click', () => {
        console.log("Botão do peixe comunista clicado");
        
        // Procurar o peixe comunista no ambiente e fazê-lo aparecer
        if (window.environment && window.environment.communistFish) {
            try {
                window.environment.communistFish.appear();
                console.log("Peixe comunista invocado!");
            } catch (e) {
                console.error("Erro ao invocar peixe comunista:", e);
            }
        } else {
            console.log("Ambiente ou peixe comunista não encontrado, tentando alternativas...");
            
            // Tenta criar um novo peixe comunista como último recurso
            try {
                // Cria um novo peixe comunista diretamente (não usa require/import dinâmico)
                const newFish = new CommunistFish(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    30
                );
                
                // Faz o peixe aparecer
                newFish.appear();
                
                // Adiciona ao ambiente se possível
                if (window.fishes) {
                    window.fishes.push(newFish);
                }
                
                // Salva no ambiente global
                window.environment = window.environment || {};
                window.environment.communistFish = newFish;
                
                console.log("Novo peixe comunista criado com sucesso!");
            } catch (e) {
                console.error("Falha na tentativa de criar novo peixe comunista:", e);
                alert("Não foi possível invocar o camarada peixe. Erro: " + e.message);
            }
        }
    });
    
    controls.appendChild(communistButton);
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
