import Entity from './entity.js';
import { checkCollision } from '../utils/collision.js';
import { normalize, magnitude, subtractVectors, multiplyVector, addVectors } from '../utils/vector.js';
import Wander from '../behaviors/wander.js';
import SeekFood from '../behaviors/seekFood.js';
import Flee from '../behaviors/flee.js';
import Hide from '../behaviors/hide.js';
import Schooling from '../behaviors/schooling.js';
import { createThoughtBubble } from '../utils/thoughtBubble.js';
// Removida a importação circular para CommunistFish ou createCommunistFish

class Fish extends Entity {
    constructor(x, y, size, species, color, isPredator = false) {
        super(x, y, size);
        this.id = Math.random().toString(36).substr(2, 9); // Add unique ID for each fish
        this.species = species;
        this.color = color;
        this.isPredator = isPredator;
        // Reduzindo a velocidade máxima dos peixes
        this.maxSpeed = isPredator ? 2 : 1.3; // Reduzido de 3/2 para 2/1.3
        this.perceptionRadius = size * 5;
        this.hunger = 0;
        this.energy = 100;
        this.direction = Math.random() * Math.PI * 2;
        this.hiding = false;
        this.currentHideout = null;
        
        // Variáveis para animação - reduzindo a frequência do movimento da cauda
        this.tailAmplitude = 0.3;
        this.tailFrequency = 0.15; // Reduzido de 0.2 para 0.15
        this.tailPhase = Math.random() * Math.PI * 2;
        
        // Comportamentos
        this.behaviors = {
            wander: new Wander(this),
            seekFood: new SeekFood(this),
            flee: new Flee(this),
            hide: new Hide(this),
            school: new Schooling(this)
        };
        
        // Pensamentos possíveis para cada comportamento
        this.thoughts = {
            wander: [
                "Só nadando por aí...",
                "Que água agradável hoje!",
                "Adoro explorar o aquário.",
                "Onde será que tem algo interessante?"
            ],
            seek: [
                "Estou com fome!",
                "Aquilo parece delicioso!",
                "Hora de comer!",
                "Vou atrás daquela comida."
            ],
            flee: [
                "Socorro! Um predador!",
                "Preciso fugir!",
                "Isso não parece seguro...",
                "Tenho que me esconder rápido!"
            ],
            hide: [
                "Vou me esconder aqui.",
                "Esta toca parece segura.",
                "Ninguém vai me encontrar aqui!",
                "Um bom lugar para descansar."
            ]
        };
        
        // Intervalo para pensar algo novo
        this.thinkInterval = Math.random() * 300 + 200;
        this.thinkTimer = this.thinkInterval;
        // Timestamp da última vez que o peixe pensou algo
        this.lastThoughtTime = 0;
        // Cooldown entre pensamentos (em ms) - aumentado para evitar pensamentos frequentes demais
        this.thoughtCooldown = 8000 + Math.random() * 4000; // 8-12 segundos (aumentado)
        
        // Chance de pensamento espontâneo após um evento
        this.eventThoughtChance = 0.3;
    }

    update(fishes, corals, jellyfishes, hideouts, algae) {
        if (!this.alive) return;
        
        this.hunger += 0.05;
        this.energy -= 0.01;
        
        // Atualiza a fase da cauda para animação
        this.tailPhase += this.tailFrequency;
        
        if (this.hiding) {
            // Se escondido, apenas descansa
            this.energy = Math.min(100, this.energy + 0.1);
            return;
        }
        
        // Combina possíveis alvos de comida
        let foodTargets = [];
        
        if (this.isPredator) {
            // Predadores buscam peixes menores
            foodTargets = fishes.filter(f => f !== this && !f.isPredator && f.size < this.size);
        } else {
            // Herbívoros buscam algas e corais
            foodTargets = [...corals, ...(algae || [])];
        }
        
        // Determina comportamento com base no estado atual
        let force = { x: 0, y: 0 };
        
        // Decide qual comportamento utilizar
        if (this.hunger > 70) {
            // Buscar comida tem prioridade alta se estiver com fome
            force = addVectors(force, this.behaviors.seekFood.update(foodTargets));
        } else {
            // Verifica ameaças
            const fleeForce = this.behaviors.flee.update(fishes);
            
            if (this.behaviors.flee.isAfraidOfSomething()) {
                // Se detectou ameaças, decide entre fugir ou se esconder
                force = addVectors(force, fleeForce);
                
                // Chance de procurar esconderijo
                if (Math.random() < 0.3 && hideouts.length > 0) {
                    const hideForce = this.behaviors.hide.update(hideouts, true);
                    force = addVectors(force, hideForce);
                }
            } else {
                // Comportamento de cardume para peixes da mesma espécie
                const schoolForce = this.behaviors.school.update(fishes);
                force = addVectors(force, schoolForce);
                
                // Se não está em cardume ou com chances aleatórias, vagueia
                if (!this.behaviors.school.hasNeighbors() || Math.random() < 0.3) {
                    const wanderForce = this.behaviors.wander.calculate();
                    force = addVectors(force, wanderForce);
                }
                
                // Chance de deixar um esconderijo se estiver escondido
                if (this.behaviors.hide.isHiding()) {
                    this.behaviors.hide.update([], false);
                }
            }
        }
        
        // Chance de pensamento baseado no comportamento atual
        this.checkBehaviorThoughts();
        
        // Aplica a força resultante
        this.applyForce(force);
        
        // Atualiza a posição com física
        super.update();
    }
    
    checkBehaviorThoughts() {
        // Chance pequena de gerar um pensamento baseado no comportamento atual
        if (Math.random() < 0.0002) { // 0.02% de chance por frame
            let thoughtType = null;
            
            // Determina o tipo de pensamento com base no estado atual
            if (this.hiding) {
                thoughtType = "hide";
            } else if (this.hunger > 70) {
                thoughtType = "seek";
            } else if (this.behaviors.flee.isAfraidOfSomething()) {
                thoughtType = "flee";
            } else {
                thoughtType = "wander";
            }
            
            // Se temos pensamentos para este comportamento, escolha um aleatório
            if (this.thoughts[thoughtType] && this.thoughts[thoughtType].length > 0) {
                const thoughts = this.thoughts[thoughtType];
                const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
                this.think(randomThought);
            }
        }
    }
    
    eat(entity) {
        if (!entity.alive) return;
        
        if (this.isPredator && entity instanceof Fish) {
            // Verificar se é um peixe comunista antes de matá-lo
            const isCommunistFish = entity.constructor.name === 'CommunistFish';
            
            // Mata o peixe
            entity.die();
            this.hunger = 0;
            this.energy = Math.min(100, this.energy + 30);
            this.think("Que delícia! Acabei de comer um " + entity.species);
            
            // Se era um peixe comunista, cria um novo em outro lugar
            if (isCommunistFish) {
                console.log("Um Peixe Comunista foi devorado! Outro surgirá para continuar a revolução!");
                
                // Aguarda um momento antes de criar um novo (efeito dramático)
                setTimeout(() => {
                    // Dispara um evento personalizado para que o sistema principal crie um novo peixe comunista
                    const event = new CustomEvent('createCommunistFish');
                    window.dispatchEvent(event);
                }, 2000);
            }
        } else if (!this.isPredator) {
            // Peixes herbívoros comem algas ou corais
            entity.beEaten(this.size * 0.5);
            this.hunger = Math.max(0, this.hunger - 30);
            this.energy = Math.min(100, this.energy + 10);
            this.think("Estou me alimentando destas plantas saborosas!");
        }
    }
    
    hide(hideout) {
        // Modificando para não causar chamada recursiva
        // Ao invés de usar o behavior, vamos implementar diretamente
        if (hideout && !this.hiding) {
            if (hideout.addOccupant(this)) {
                this.hiding = true;
                this.currentHideout = hideout;
                this.velocity = { x: 0, y: 0 };
                this.position = { ...hideout.location };
                this.think("Estou me escondendo aqui dentro!");
            }
        }
    }
    
    leaveHideout() {
        // Implementação direta em vez de chamar o behavior
        if (this.hiding && this.currentHideout) {
            this.currentHideout.removeOccupant(this);
            this.hiding = false;
            
            // Armazena temporariamente o hideout atual antes de limpar a referência
            const hideout = this.currentHideout;
            this.currentHideout = null;
            
            // Move o peixe para fora do esconderijo
            this.position.x += Math.random() * 20 - 10;
            this.position.y += Math.random() * 20 - 10;
            
            this.think("Saindo do esconderijo...");
            
            // Atualiza o status do behavior também
            if (this.behaviors && this.behaviors.hide) {
                this.behaviors.hide.hiding = false;
                this.behaviors.hide.targetHideout = null;
            }
        }
    }
    
    think(thought) {
        const currentTime = Date.now();
        
        // Verifica se já passou tempo suficiente desde o último pensamento
        if (currentTime - this.lastThoughtTime < 5000) {
            return null;
        }
        
        this.thought = thought;
        this.thinkingTime = 100;
        this.lastThoughtTime = currentTime;
        
        console.log(`${this.species} pensa: "${thought}"`);
        
        // Simplificação - não passamos coordenadas, apenas a entidade
        return createThoughtBubble(thought, 0, 0, this);
    }
    
    forceThink(thought) {
        this.thought = thought;
        this.thinkingTime = 100;
        this.lastThoughtTime = Date.now();
        
        console.log(`${this.species} é forçado a pensar: "${thought}"`);
        
        // Simplificação - não passamos coordenadas, apenas a entidade
        return createThoughtBubble(thought, 0, 0, this, true);
    }

    display() {
        if (!this.alive) return;
        
        // Cor base do peixe
        const ctx = window._renderer.drawingContext;
        ctx.fillStyle = this.color;
        
        // Direção para onde o peixe está nadando
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        
        // Calcula a ondulação da cauda para animação
        const tailWag = Math.sin(this.tailPhase) * this.tailAmplitude;
        
        // Corpo do peixe
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, this.size / 2);
        ctx.lineTo(-this.size, -this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        // Olho
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.size / 2, -this.size / 4, this.size / 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.size / 2, -this.size / 4, this.size / 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Cauda animada
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.5, (this.size / 1.5) + tailWag);
        ctx.lineTo(-this.size * 1.5, (-this.size / 1.5) + tailWag);
        ctx.closePath();
        ctx.fill();
        
        // Barbatanas
        if (!this.isPredator) {
            // Barbatana dorsal
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(-this.size / 2, -this.size);
            ctx.lineTo(-this.size, -this.size / 2);
            ctx.closePath();
            ctx.fill();
            
            // Barbatana ventral
            ctx.beginPath();
            ctx.moveTo(0, this.size / 2);
            ctx.lineTo(-this.size / 2, this.size);
            ctx.lineTo(-this.size, this.size / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            // Barbatana dorsal de predador
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, -this.size);
            ctx.lineTo(-this.size / 2, -this.size / 2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
}

export default Fish;
