import { createThoughtBubble } from '../utils/thoughtBubble.js';

class Behavior {
    constructor(entity) {
        this.entity = entity;
        this.active = false;
        this.weight = 1.0; // Peso para comportamentos combinados
    }

    setActive(active) {
        this.active = active;
    }

    isActive() {
        return this.active;
    }

    setWeight(weight) {
        this.weight = weight;
    }

    calculate() {
        // Método a ser implementado nas subclasses
        // Deve retornar uma força como um vetor {x, y}
        return { x: 0, y: 0 };
    }

    applyBehavior() {
        if (!this.active || !this.entity) return;
        
        const force = this.calculate();
        this.entity.applyForce(force);
    }

    think(message) {
        if (!this.entity) return;
        
        createThoughtBubble(
            message,
            this.entity.position.x,
            this.entity.position.y - this.entity.size - 10
        );
    }
}

export default Behavior;