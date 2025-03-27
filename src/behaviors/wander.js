import Behavior from './behavior.js';
import { fromAngle, multiplyVector } from '../utils/vector.js';
import { createThoughtBubble } from '../utils/thoughtBubble.js';

class Wander extends Behavior {
    constructor(entity) {
        super(entity);
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderRadius = 10;
        this.wanderDistance = 60;
        this.wanderJitter = 0.5;
        
        this.thoughts = [
            "Estou tão entediado, vou nadar por aí!",
            "Onde está a comida?",
            "Preciso me afastar dos predadores!",
            "Que lugar bonito para explorar!",
            "Adoro nadar nessas águas cristalinas.",
            "Acho que vou apenas relaxar um pouco.",
            "O que será que tem do outro lado do aquário?",
            "Vou procurar novos amigos para formar um cardume."
        ];
        
        this.thinkTimer = Math.floor(Math.random() * 300) + 200;
    }

    update() {
        this.think();
        this.moveRandomly();
    }

    calculate() {
        // Adiciona um pouco de aleatoriedade ao ângulo
        this.wanderAngle += (Math.random() * 2 - 1) * this.wanderJitter;
        
        // Calcula a posição no círculo de vagar
        let angle = 0;
        
        if (this.entity.velocity.x === 0 && this.entity.velocity.y === 0) {
            angle = Math.random() * Math.PI * 2;
        } else {
            angle = Math.atan2(this.entity.velocity.y, this.entity.velocity.x);
        }
        
        const circlePos = fromAngle(angle, this.wanderDistance);
        
        // Calcula a força com base na posição no círculo e na perturbação
        const displacement = fromAngle(this.wanderAngle, this.wanderRadius);
        
        // A força resultante é a soma do deslocamento e a posição no círculo
        const wanderForce = {
            x: circlePos.x + displacement.x,
            y: circlePos.y + displacement.y
        };
        
        // Atualiza o contador de pensamentos
        this.thinkTimer--;
        if (this.thinkTimer <= 0) {
            this.randomThought();
            this.thinkTimer = Math.floor(Math.random() * 300) + 200;
        }
        
        // Reduzindo a força de vagar para movimentos mais lentos
        return multiplyVector(wanderForce, 0.03); // Reduzido de 0.05 para 0.03
    }

    think() {
        const thoughts = [
            "Estou tão entediado, vou nadar por aí!",
            "Onde está a comida?",
            "Preciso me afastar dos predadores!",
            "Que lugar bonito para explorar!",
        ];
        const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
        this.showThoughtBubble(randomThought);
    }

    moveRandomly() {
        const randomDirection = createVector(random(-1, 1), random(-1, 1));
        randomDirection.setMag(this.entity.speed);
        this.entity.position.add(randomDirection);
    }

    showThoughtBubble(thought) {
        // Função para exibir o balão de pensamento
        // Implementação deve ser feita em thoughtBubble.js
        createThoughtBubble(this.entity.position, thought);
    }

    randomThought() {
        const thought = this.thoughts[Math.floor(Math.random() * this.thoughts.length)];
        this.think(thought);
    }
}

export default Wander;