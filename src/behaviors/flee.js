import Behavior from './behavior.js';
import { subtractVectors, normalize, multiplyVector, distanceBetween } from '../utils/vector.js';

class Flee extends Behavior {
    constructor(entity) {
        super(entity);
        this.threats = [];
        this.fearRadius = entity.size * 7;
        this.maxForce = 0.15; // Reduzido de 0.2 para 0.15
        
        this.thoughts = [
            "Socorro! Um predador!",
            "Preciso fugir rápido!",
            "Ele vai me comer!",
            "Nado por minha vida!",
            "Perigo! Predador à vista!",
            "Ah não, melhor escapar daqui!",
            "Isso não parece nada bom...",
            "Nadando o mais rápido possível!"
        ];
        
        this.lastThoughtTime = 0;
    }

    updateThreats(possibleThreats) {
        if (!possibleThreats || possibleThreats.length === 0) {
            this.threats = [];
            return;
        }
        
        this.threats = [];
        
        for (const threat of possibleThreats) {
            // Ignora ameaças mortas ou se o próprio peixe for predador
            if (!threat.alive || this.entity.isPredator) continue;
            
            // Só considera como ameaça entidades predadoras
            if (!threat.isPredator) continue;
            
            const distance = distanceBetween(this.entity.position, threat.position);
            
            if (distance < this.fearRadius) {
                this.threats.push({
                    entity: threat,
                    distance: distance
                });
            }
        }
        
        // Ordena ameaças pela distância (mais próximas primeiro)
        this.threats.sort((a, b) => a.distance - b.distance);
    }

    calculate() {
        if (this.threats.length === 0) {
            return { x: 0, y: 0 };
        }
        
        // Se detectou ameaças, pensa com mais frequência
        const currentTime = Date.now();
        if (currentTime - this.lastThoughtTime > 2000) {
            const thought = this.thoughts[Math.floor(Math.random() * this.thoughts.length)];
            this.think(thought);
            this.lastThoughtTime = currentTime;
        }
        
        // Calcula a direção composta para fugir de todas as ameaças
        let fleeDirection = { x: 0, y: 0 };
        
        for (const threat of this.threats) {
            // Direção da ameaça para a entidade
            const direction = subtractVectors(this.entity.position, threat.entity.position);
            
            // Normaliza e dá mais peso às ameaças mais próximas
            const normalized = normalize(direction);
            const weightedDirection = multiplyVector(normalized, 1 / threat.distance);
            
            // Adiciona ao vetor de fuga composto
            fleeDirection.x += weightedDirection.x;
            fleeDirection.y += weightedDirection.y;
        }
        
        // Normaliza e aplica a força máxima
        const normalizedFlee = normalize(fleeDirection);
        return multiplyVector(normalizedFlee, this.maxForce);
    }
    
    update(possibleThreats) {
        this.updateThreats(possibleThreats);
        return this.calculate();
    }
    
    isAfraidOfSomething() {
        return this.threats.length > 0;
    }
}

export default Flee;