import { addVectors, multiplyVector, normalize, magnitude } from '../utils/vector.js';
import { createThoughtBubble } from '../utils/thoughtBubble.js';

class Entity {
    constructor(x, y, size = 1) {
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.size = size;
        this.alive = true;
        this.maxSpeed = 2;
        this.color = "#FFFFFF";
        this.thought = "";
        this.thinkingTime = 0;
    }

    update() {
        // Atualiza a posição com base na velocidade
        this.velocity = addVectors(this.velocity, this.acceleration);
        
        // Limita a velocidade máxima
        const speed = magnitude(this.velocity);
        if (speed > this.maxSpeed) {
            this.velocity = multiplyVector(normalize(this.velocity), this.maxSpeed);
        }
        
        this.position = addVectors(this.position, this.velocity);
        this.acceleration = { x: 0, y: 0 }; // Reseta aceleração
        
        // Verifica limites da tela
        this.checkBoundaries();
        
        // Reduz o tempo de pensamento
        if (this.thinkingTime > 0) {
            this.thinkingTime--;
        }
    }

    applyForce(force) {
        this.acceleration = addVectors(this.acceleration, force);
    }

    checkBoundaries() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (this.position.x < 0) this.position.x = width;
        if (this.position.x > width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = height;
        if (this.position.y > height) this.position.y = 0;
    }

    think(thought) {
        this.thought = thought;
        this.thinkingTime = 100; // Duração do pensamento em frames
        createThoughtBubble(thought, this.position.x, this.position.y - this.size - 10);
    }

    isAlive() {
        return this.alive;
    }

    die() {
        this.alive = false;
    }
    
    display() {
        // Método a ser sobrescrito pelas subclasses
    }
}

export default Entity;