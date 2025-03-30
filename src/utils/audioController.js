/**
 * Controla os áudios do aquário
 */

// Armazena os áudios carregados
const audioLibrary = {};
let isMuted = false;
let currentlyPlaying = [];

/**
 * Carrega um áudio na biblioteca
 * @param {string} id - Identificador único do áudio
 * @param {string} path - Caminho para o arquivo de áudio
 * @param {boolean} loop - Se o áudio deve ser reproduzido em loop
 */
export function loadAudio(id, path, loop = false) {
    const audio = new Audio(path);
    audio.loop = loop;
    
    audioLibrary[id] = {
        element: audio,
        path: path,
        loop: loop
    };
    
    return audio;
}

/**
 * Reproduz um áudio
 * @param {string} id - Identificador do áudio
 * @param {number} volume - Volume (0 a 1)
 */
export function playAudio(id, volume = 0.5) {
    if (isMuted || !audioLibrary[id]) return;
    
    const audio = audioLibrary[id].element;
    audio.volume = volume;
    
    // Tenta reproduzir o áudio (pode falhar por interação do usuário)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            if (!currentlyPlaying.includes(id)) {
                currentlyPlaying.push(id);
            }
        }).catch(error => {
            console.error("Não foi possível reproduzir o áudio:", error);
        });
    }
}

/**
 * Para de reproduzir um áudio
 * @param {string} id - Identificador do áudio
 */
export function stopAudio(id) {
    if (!audioLibrary[id]) return;
    
    const audio = audioLibrary[id].element;
    audio.pause();
    audio.currentTime = 0;
    
    const index = currentlyPlaying.indexOf(id);
    if (index > -1) {
        currentlyPlaying.splice(index, 1);
    }
}

/**
 * Ativa ou desativa todos os sons
 * @param {boolean} mute - Se os sons devem ser silenciados
 */
export function muteAll(mute) {
    isMuted = mute;
    
    if (mute) {
        // Pausar todos os áudios atualmente em reprodução
        currentlyPlaying.forEach(id => {
            if (audioLibrary[id]) {
                audioLibrary[id].element.pause();
            }
        });
    } else {
        // Retomar os áudios que estavam sendo reproduzidos
        currentlyPlaying.forEach(id => {
            if (audioLibrary[id]) {
                audioLibrary[id].element.play().catch(e => console.error(e));
            }
        });
    }
}

/**
 * Inicializa o controlador de áudio
 */
export function initAudioController() {
    // O hino soviético foi removido daqui
    
    // Adicionar um botão para controle de som ao UI
    addMuteButton();
}

/**
 * Adiciona um botão de mudo à interface do usuário
 */
function addMuteButton() {
    const controls = document.querySelector('.ui-controls');
    if (!controls) return;
    
    const muteButton = document.createElement('button');
    muteButton.className = 'mute-button';
    muteButton.innerHTML = '🔊';
    muteButton.title = 'Silenciar';
    
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteButton.innerHTML = isMuted ? '🔇' : '🔊';
        muteButton.title = isMuted ? 'Ativar som' : 'Silenciar';
        muteAll(isMuted);
    });
    
    controls.appendChild(muteButton);
}
