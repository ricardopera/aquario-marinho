import Behavior from './behavior.js';
import { subtractVectors, normalize, multiplyVector, distanceBetween } from '../utils/vector.js';

class Hide extends Behavior {
    constructor(entity) {
        super(entity);
        this.targetHideout = null;
        this.maxForce = 0.15;
        this.searchRadius = 200;
        this.hiding = false;
        
        this.thoughts = {
            searching: [
                "Preciso encontrar um esconderijo!",
                "Onde posso me esconder?",
                "Preciso de um lugar seguro!",
                "Será que tem alguma caverna por aqui?"
            ],
            approaching: [
                "Achei um lugar para me esconder!",
                "Estou indo para aquela caverna!",
                "Aquele esconderijo parece seguro!",
                "Vou me abrigar ali!"
            ],
            hiding: [
                "Estou escondido, ninguém pode me ver!",
                "Que bom estar seguro aqui dentro!",
                "O perigo já passou?",
                "Vou esperar aqui mais um pouco..."
            ],
            leaving: [
                "Acho que já posso sair...",
                "Hora de explorar novamente!",
                "Não vejo mais o perigo, vou sair!",
                "Voltando para o oceano aberto!"
            ]
        };
    }

    findHideout(hideouts) {
        if (!hideouts || hideouts.length === 0) return null;
        
        let bestHideout = null;
        let shortestDistance = Infinity;
        
        for (const hideout of hideouts) {
            if (hideout.isFull()) continue;
            
            const distance = distanceBetween(this.entity.position, hideout.position);
            
            if (distance < this.searchRadius && distance < shortestDistance) {
                shortestDistance = distance;
                bestHideout = hideout;
            }
        }
        
        return bestHideout;
    }

    calculate() {
        if (this.hiding) {
            // Se já está escondido, não precisa de força direcional
            return { x: 0, y: 0 };
        }
        
        if (!this.targetHideout) {
            return { x: 0, y: 0 };
        }
        
        // Direção para o esconderijo
        const direction = subtractVectors(this.targetHideout.position, this.entity.position);
        const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        
        // Se chegou perto o suficiente, esconde
        if (distance < this.entity.size + this.targetHideout.size) {
            // Alteração aqui para evitar chamada recursiva
            if (!this.entity.hiding) {
                // Marca o status do esconderijo
                this.hiding = true;
                
                // Adiciona o peixe ao esconderijo diretamente
                if (this.targetHideout.addOccupant(this.entity)) {
                    // Atualiza os atributos da entidade
                    this.entity.hiding = true;
                    this.entity.currentHideout = this.targetHideout;
                    this.entity.velocity = { x: 0, y: 0 };
                    this.entity.position = { ...this.targetHideout.location };
                    
                    // Mostra pensamento
                    const hidingThought = this.thoughts.hiding[Math.floor(Math.random() * this.thoughts.hiding.length)];
                    this.think(hidingThought);
                }
            }
            return { x: 0, y: 0 };
        }
        
        // Segue em direção ao esconderijo
        const normalized = normalize(direction);
        return multiplyVector(normalized, this.maxForce);
    }
    
    update(hideouts, shouldHide) {
        if (this.hiding) {
            // Ocasionalmente pensa enquanto está escondido
            if (Math.random() < 0.005) {
                const hidingThought = this.thoughts.hiding[Math.floor(Math.random() * this.thoughts.hiding.length)];
                this.think(hidingThought);
            }
            
            // Verifica se deve sair do esconderijo
            if (!shouldHide && Math.random() < 0.02) {
                this.leaveHideout();
            }
            
            return { x: 0, y: 0 };
        }
        
        if (shouldHide && !this.targetHideout) {
            this.targetHideout = this.findHideout(hideouts);
            
            if (this.targetHideout) {
                const approachingThought = this.thoughts.approaching[Math.floor(Math.random() * this.thoughts.approaching.length)];
                this.think(approachingThought);
            } else {
                const searchingThought = this.thoughts.searching[Math.floor(Math.random() * this.thoughts.searching.length)];
                this.think(searchingThought);
            }
        }
        
        return this.calculate();
    }
    
    leaveHideout() {
        if (this.hiding && this.entity && this.entity.hiding) {
            const leavingThought = this.thoughts.leaving[Math.floor(Math.random() * this.thoughts.leaving.length)];
            this.think(leavingThought);
            
            // Implementação direta em vez de chamar o método da entidade
            if (this.entity.currentHideout) {
                this.entity.currentHideout.removeOccupant(this.entity);
                
                // Atualiza os estados
                this.entity.hiding = false;
                this.entity.currentHideout = null;
                this.hiding = false;
                this.targetHideout = null;
                
                // Move o peixe para fora do esconderijo
                this.entity.position.x += Math.random() * 20 - 10;
                this.entity.position.y += Math.random() * 20 - 10;
            }
        }
    }
    
    isHiding() {
        return this.hiding;
    }
}

export default Hide;