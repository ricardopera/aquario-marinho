import Behavior from './behavior.js';
import { subtractVectors, normalize, multiplyVector, distanceBetween } from '../utils/vector.js';

class SeekFood extends Behavior {
    constructor(entity) {
        super(entity);
        this.targetEntity = null;
        this.maxForce = 0.07; // Reduzido de 0.1 para 0.07
        this.perceptionRadius = entity.size * 5;
        
        this.thoughts = {
            seeking: [
                "Estou com fome, preciso encontrar comida!",
                "Onde tem algo para comer por aqui?",
                "Meu estômago está roncando...",
                "Preciso de energia!"
            ],
            found: [
                "Achei comida! Vou pegá-la!",
                "Parece delicioso! Vou me aproximar...",
                "Aquilo parece bom para comer!",
                "Finalmente encontrei algo para saciar minha fome!"
            ],
            eating: [
                "Que delícia! Estou me alimentando...",
                "Mmm, isso é muito bom!",
                "Estou matando minha fome...",
                "Energias sendo recarregadas!"
            ]
        };
    }

    findTarget(possibleTargets) {
        if (!possibleTargets || possibleTargets.length === 0) return null;
        
        let closestTarget = null;
        let closestDistance = Infinity;
        
        for (const target of possibleTargets) {
            // Pula entidades mortas
            if (!target.alive) continue;
            
            // Se o peixe for predador, só deve procurar peixes não-predadores menores
            if (this.entity.isPredator) {
                if (!('isPredator' in target) || 
                    target.isPredator || 
                    target.size >= this.entity.size) continue;
            } 
            // Se não for predador, só deve procurar algas/corais
            else {
                if ('isPredator' in target) continue;
            }
            
            const distance = distanceBetween(this.entity.position, target.position);
            
            if (distance < this.perceptionRadius && distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        }
        
        return closestTarget;
    }

    calculate() {
        if (!this.targetEntity || !this.targetEntity.alive) {
            return { x: 0, y: 0 };
        }
        
        // Direção para o alvo
        const direction = subtractVectors(this.targetEntity.position, this.entity.position);
        const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        
        // Se estiver perto o suficiente, tenta comer
        if (distance < this.entity.size + this.targetEntity.size) {
            if (this.entity.eat) {
                this.entity.eat(this.targetEntity);
                const eatingThought = this.thoughts.eating[Math.floor(Math.random() * this.thoughts.eating.length)];
                this.think(eatingThought);
            }
            this.targetEntity = null;
            return { x: 0, y: 0 };
        }
        
        // Caso contrário, segue em direção ao alvo
        const normalized = normalize(direction);
        return multiplyVector(normalized, this.maxForce);
    }
    
    update(possibleTargets) {
        if (!this.targetEntity || !this.targetEntity.alive) {
            this.targetEntity = this.findTarget(possibleTargets);
            
            if (this.targetEntity) {
                const foundThought = this.thoughts.found[Math.floor(Math.random() * this.thoughts.found.length)];
                this.think(foundThought);
            } else if (Math.random() < 0.01) { // Pensamento ocasional durante a procura
                const seekingThought = this.thoughts.seeking[Math.floor(Math.random() * this.thoughts.seeking.length)];
                this.think(seekingThought);
            }
        }
        
        return this.calculate();
    }
}

export default SeekFood;