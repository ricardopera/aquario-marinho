import Behavior from './behavior.js';
import { subtractVectors, normalize, multiplyVector, addVectors, divideVector } from '../utils/vector.js';

class Schooling extends Behavior {
    constructor(entity) {
        super(entity);
        this.neighbors = [];
        this.separationWeight = 1.5;
        this.alignmentWeight = 1.0;
        this.cohesionWeight = 1.0;
        this.neighborRadius = entity.size * 8;
        
        this.thoughts = [
            "Nadando com meus amigos!",
            "É bom fazer parte de um cardume!",
            "Juntos somos mais fortes!",
            "Vamos todos nessa direção!",
            "Seguindo o grupo...",
            "Que cardume bonito!"
        ];
    }

    findNeighbors(fishes) {
        if (!fishes || fishes.length === 0) return [];
        
        this.neighbors = [];
        
        for (const fish of fishes) {
            // Ignora a si mesmo, peixes mortos ou de espécies diferentes
            if (fish === this.entity || !fish.alive || fish.species !== this.entity.species) continue;
            
            const dx = fish.position.x - this.entity.position.x;
            const dy = fish.position.y - this.entity.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.neighborRadius) {
                this.neighbors.push(fish);
            }
        }
        
        return this.neighbors;
    }

    // Cálculo de separação - evitar sobreposição com outros peixes
    separate() {
        if (this.neighbors.length === 0) return { x: 0, y: 0 };
        
        let force = { x: 0, y: 0 };
        let count = 0;
        
        for (const neighbor of this.neighbors) {
            const dx = this.entity.position.x - neighbor.position.x;
            const dy = this.entity.position.y - neighbor.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Quanto mais próximo, maior a força de separação
            if (distance > 0 && distance < this.entity.size * 3) {
                const repulsion = {
                    x: dx / (distance * distance),
                    y: dy / (distance * distance)
                };
                
                force = addVectors(force, repulsion);
                count++;
            }
        }
        
        if (count > 0) {
            force = divideVector(force, count);
            const normalized = normalize(force);
            return multiplyVector(normalized, this.separationWeight * 0.03); // Reduzido de 0.05 para 0.03
        }
        
        return { x: 0, y: 0 };
    }

    // Cálculo de alinhamento - nadar na mesma direção dos vizinhos
    align() {
        if (this.neighbors.length === 0) return { x: 0, y: 0 };
        
        let avgVelocity = { x: 0, y: 0 };
        
        for (const neighbor of this.neighbors) {
            avgVelocity = addVectors(avgVelocity, neighbor.velocity);
        }
        
        avgVelocity = divideVector(avgVelocity, this.neighbors.length);
        const normalized = normalize(avgVelocity);
        return multiplyVector(normalized, this.alignmentWeight * 0.03); // Reduzido de 0.05 para 0.03
    }

    // Cálculo de coesão - tender para o centro do cardume
    cohere() {
        if (this.neighbors.length === 0) return { x: 0, y: 0 };
        
        let center = { x: 0, y: 0 };
        
        for (const neighbor of this.neighbors) {
            center = addVectors(center, neighbor.position);
        }
        
        center = divideVector(center, this.neighbors.length);
        
        const direction = subtractVectors(center, this.entity.position);
        const normalized = normalize(direction);
        return multiplyVector(normalized, this.cohesionWeight * 0.03); // Reduzido de 0.05 para 0.03
    }

    calculate() {
        if (this.neighbors.length === 0) {
            return { x: 0, y: 0 };
        }
        
        // Ocasionalmente pensa sobre estar em um cardume
        if (this.neighbors.length > 3 && Math.random() < 0.001) {
            const thought = this.thoughts[Math.floor(Math.random() * this.thoughts.length)];
            this.think(thought);
        }
        
        // Calcula as três forças de comportamento de cardume
        const separation = this.separate();
        const alignment = this.align();
        const cohesion = this.cohere();
        
        // Combina as forças
        let force = { x: 0, y: 0 };
        force = addVectors(force, separation);
        force = addVectors(force, alignment);
        force = addVectors(force, cohesion);
        
        return force;
    }
    
    update(fishes) {
        this.findNeighbors(fishes);
        return this.calculate();
    }
    
    hasNeighbors() {
        return this.neighbors.length > 0;
    }
}

export default Schooling;
