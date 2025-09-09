/**
 * Sistema de Grid Espacial para Otimização de Colisões - Fase 1
 */

class SpatialGrid {
    constructor(width, height, cellSize = 50) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows);
        
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }

    clear() {
        for (let cell of this.grid) {
            cell.length = 0; // Rápido clear sem realocar
        }
    }

    getCellIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        // Verificar bounds
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        
        return row * this.cols + col;
    }

    addEntity(entity) {
        if (!entity || !entity.position) return;
        
        const cellIndex = this.getCellIndex(entity.position.x, entity.position.y);
        if (cellIndex >= 0 && cellIndex < this.grid.length) {
            this.grid[cellIndex].push(entity);
        }
    }

    getNearbyEntities(x, y, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);

        for (let col = centerCol - cellRadius; col <= centerCol + cellRadius; col++) {
            for (let row = centerRow - cellRadius; row <= centerRow + cellRadius; row++) {
                if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                    const cellIndex = row * this.cols + col;
                    if (cellIndex >= 0 && cellIndex < this.grid.length) {
                        nearby.push(...this.grid[cellIndex]);
                    }
                }
            }
        }
        return nearby;
    }

    getEntitiesInCell(x, y) {
        const cellIndex = this.getCellIndex(x, y);
        if (cellIndex >= 0 && cellIndex < this.grid.length) {
            return this.grid[cellIndex];
        }
        return [];
    }
}

/**
 * Gerenciador de Colisões com Grid Espacial
 */
class CollisionManager {
    constructor(canvasWidth, canvasHeight) {
        this.spatialGrid = new SpatialGrid(canvasWidth, canvasHeight);
        this.collisionPairs = new Set();
        this.lastFrameTime = performance.now();
    }

    update(entities) {
        const startTime = performance.now();
        
        this.spatialGrid.clear();
        this.collisionPairs.clear();
        
        // Populate grid - O(n)
        for (const entity of entities) {
            if (entity && entity.position) {
                this.spatialGrid.addEntity(entity);
            }
        }
        
        // Detectar colisões apenas em células próximas - much more efficient
        for (const entity of entities) {
            if (!entity || !entity.position) continue;
            
            const searchRadius = (entity.size || 20) * 2;
            const nearby = this.spatialGrid.getNearbyEntities(
                entity.position.x, 
                entity.position.y, 
                searchRadius
            );
            
            for (const other of nearby) {
                if (entity !== other && other.position) {
                    const pairKey = this.getPairKey(entity, other);
                    if (!this.collisionPairs.has(pairKey)) {
                        if (this.checkCollision(entity, other)) {
                            this.handleCollision(entity, other);
                            this.collisionPairs.add(pairKey);
                        }
                    }
                }
            }
        }
        
        this.lastFrameTime = performance.now() - startTime;
    }

    checkCollision(entity1, entity2) {
        if (!entity1.position || !entity2.position) return false;
        
        const dx = entity1.position.x - entity2.position.x;
        const dy = entity1.position.y - entity2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const radius1 = entity1.size || 20;
        const radius2 = entity2.size || 20;
        
        return distance < (radius1 + radius2) * 0.8; // Slight overlap tolerance
    }

    handleCollision(entity1, entity2) {
        // Bubble-Fish collisions
        if ((entity1.constructor.name === 'Bubble' && entity1.pop) || 
            (entity2.constructor.name === 'Bubble' && entity2.pop)) {
            
            const bubble = entity1.constructor.name === 'Bubble' ? entity1 : entity2;
            const fish = entity1.constructor.name === 'Bubble' ? entity2 : entity1;
            
            if (bubble.pop && typeof bubble.pop === 'function') {
                bubble.pop();
                // Add particle effect if available
                if (window.particles && window.particles.addParticle) {
                    window.particles.addParticle(
                        bubble.position.x, 
                        bubble.position.y, 
                        'rgba(255, 255, 255, 0.7)', 
                        8
                    );
                }
            }
            return;
        }
        
        // Fish-Fish collisions (predator system)
        if (entity1.isPredator && !entity2.isPredator && entity1.eat) {
            entity1.eat(entity2);
            if (window.particles && window.particles.addParticle) {
                window.particles.addParticle(
                    entity2.position.x, 
                    entity2.position.y, 
                    entity2.color || '#ff6b6b', 
                    15
                );
            }
        } else if (entity2.isPredator && !entity1.isPredator && entity2.eat) {
            entity2.eat(entity1);
            if (window.particles && window.particles.addParticle) {
                window.particles.addParticle(
                    entity1.position.x, 
                    entity1.position.y, 
                    entity1.color || '#ff6b6b', 
                    15
                );
            }
        }
        
        // Delegar para o sistema de colisão existente se houver
        if (typeof window.handleCollision === 'function') {
            window.handleCollision(entity1, entity2);
        }
    }

    getPairKey(entity1, entity2) {
        const id1 = entity1.id || entity1;
        const id2 = entity2.id || entity2;
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    }

    getPerformanceMetrics() {
        return {
            lastFrameTime: this.lastFrameTime,
            gridCells: this.spatialGrid.grid.length,
            activePairs: this.collisionPairs.size
        };
    }

    // Debug visualization
    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let col = 0; col <= this.spatialGrid.cols; col++) {
            const x = col * this.spatialGrid.cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.spatialGrid.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = 0; row <= this.spatialGrid.rows; row++) {
            const y = row * this.spatialGrid.cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.spatialGrid.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

export { SpatialGrid, CollisionManager };