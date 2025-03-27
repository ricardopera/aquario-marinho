function checkCollision(entityA, entityB) {
    // Calcula a distância entre as duas entidades
    const dx = entityA.position.x - entityB.position.x;
    const dy = entityA.position.y - entityB.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Verifica se a distância é menor que a soma dos raios
    return distance < (entityA.size + entityB.size) / 2;
}

function handleCollision(entityA, entityB) {
    // Se um é predador e o outro não, o predador come a presa
    if (entityA.isPredator && !entityB.isPredator) {
        entityA.eat(entityB);
        return true;
    } else if (entityB.isPredator && !entityA.isPredator) {
        entityB.eat(entityA);
        return true;
    }
    
    // Se dois predadores, eles podem competir ou se evitar
    if (entityA.isPredator && entityB.isPredator) {
        // O maior intimida o menor
        if (entityA.size > entityB.size * 1.5) {
            entityB.fleeFromPredators([entityA]);
            return true;
        } else if (entityB.size > entityA.size * 1.5) {
            entityA.fleeFromPredators([entityB]);
            return true;
        }
    }
    
    // Peixes da mesma espécie podem se agrupar (schooling behavior)
    if (!entityA.isPredator && !entityB.isPredator && entityA.species === entityB.species) {
        return false; // Permite sobreposição em cardumes
    }
    
    // Peixes diferentes se evitam
    pushApart(entityA, entityB);
    return false;
}

function pushApart(entityA, entityB) {
    // Vetor de direção da colisão
    const dx = entityA.position.x - entityB.position.x;
    const dy = entityA.position.y - entityB.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Evita divisão por zero
    
    // Força de repulsão inversamente proporcional à distância
    const force = (entityA.size + entityB.size) / (2 * distance);
    
    // Normaliza e aplica a força
    const forceX = dx / distance * force * 0.05;
    const forceY = dy / distance * force * 0.05;
    
    // Aplica a força em direções opostas
    entityA.position.x += forceX;
    entityA.position.y += forceY;
    entityB.position.x -= forceX;
    entityB.position.y -= forceY;
}

// Criar uma classe para um sistema de particulas (para efeitos visuais de colisão)
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    addParticle(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            const size = 1 + Math.random() * 3;
            const speed = 0.5 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            const lifespan = 20 + Math.random() * 40;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                lifespan,
                initialLifespan: lifespan
            });
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Atualiza posição
            p.x += p.vx;
            p.y += p.vy;
            
            // Reduz tempo de vida
            p.lifespan--;
            
            // Remove partículas mortas
            if (p.lifespan <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    display(ctx) {
        for (const p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.lifespan / p.initialLifespan;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

export { checkCollision, handleCollision, pushApart, ParticleSystem };