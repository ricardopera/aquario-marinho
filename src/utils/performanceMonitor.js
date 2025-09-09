/**
 * Sistema de Monitoramento de Performance - Fase 1
 */

class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.lastFpsUpdate = performance.now();
        this.frameTime = 0;
        this.entityCount = 0;
        
        this.metrics = {
            avgFps: 0,
            minFps: Infinity,
            maxFps: 0,
            memoryUsage: 0,
            renderTime: 0
        };
        
        this.isVisible = false;
        this.fpsHistory = [];
        this.maxHistorySize = 60; // 1 segundo a 60 FPS
        
        this.createUI();
        this.setupControls();
    }

    update() {
        const now = performance.now();
        this.frameTime = now - this.lastTime;
        this.frameCount++;
        
        // Calcular FPS a cada segundo
        if (now - this.lastFpsUpdate > 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.updateMetrics();
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            if (this.isVisible) {
                this.updateDisplay();
            }
        }
        
        this.lastTime = now;
    }

    updateMetrics() {
        // Histórico de FPS
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
            this.fpsHistory.shift();
        }
        
        // Calcular estatísticas
        this.metrics.avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        this.metrics.minFps = Math.min(this.fps, this.metrics.minFps);
        this.metrics.maxFps = Math.max(this.fps, this.metrics.maxFps);
        
        // Uso de memória (se disponível)
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100; // MB
        }
    }

    setEntityCount(count) {
        this.entityCount = count;
    }

    createUI() {
        this.panel = document.createElement('div');
        this.panel.className = 'performance-panel';
        this.panel.innerHTML = `
            <div class="perf-header">Performance Monitor <span class="toggle-hint">(F1)</span></div>
            <div class="perf-metric">FPS: <span id="fps-value" class="perf-good">--</span></div>
            <div class="perf-metric">Avg FPS: <span id="avgfps-value">--</span></div>
            <div class="perf-metric">Frame Time: <span id="frametime-value">--</span>ms</div>
            <div class="perf-metric">Entities: <span id="entities-value">--</span></div>
            <div class="perf-metric">Memory: <span id="memory-value">--</span>MB</div>
            <div class="perf-metric">Status: <span id="status-value" class="perf-good">OK</span></div>
        `;
        
        document.body.appendChild(this.panel);
        this.applyStyles();
    }

    applyStyles() {
        const styles = {
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Courier New, monospace',
            fontSize: '12px',
            zIndex: '10000',
            minWidth: '200px',
            display: 'none'
        };
        
        Object.assign(this.panel.style, styles);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.panel.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateDisplay();
        }
    }

    updateDisplay() {
        if (!this.isVisible) return;

        const fpsElement = document.getElementById('fps-value');
        const avgFpsElement = document.getElementById('avgfps-value');
        const frameTimeElement = document.getElementById('frametime-value');
        const entitiesElement = document.getElementById('entities-value');
        const memoryElement = document.getElementById('memory-value');
        const statusElement = document.getElementById('status-value');

        if (fpsElement) {
            fpsElement.textContent = this.fps;
            fpsElement.className = this.getFpsClass(this.fps);
        }

        if (avgFpsElement) {
            avgFpsElement.textContent = Math.round(this.metrics.avgFps);
        }

        if (frameTimeElement) {
            frameTimeElement.textContent = Math.round(this.frameTime * 100) / 100;
        }

        if (entitiesElement) {
            entitiesElement.textContent = this.entityCount;
        }

        if (memoryElement) {
            memoryElement.textContent = this.metrics.memoryUsage || 'N/A';
        }

        if (statusElement) {
            const status = this.getPerformanceStatus();
            statusElement.textContent = status.text;
            statusElement.className = status.class;
        }
    }

    getFpsClass(fps) {
        if (fps >= 55) return 'perf-good';
        if (fps >= 30) return 'perf-warning';
        return 'perf-bad';
    }

    getPerformanceStatus() {
        if (this.fps >= 55) {
            return { text: 'EXCELLENT', class: 'perf-good' };
        } else if (this.fps >= 45) {
            return { text: 'GOOD', class: 'perf-good' };
        } else if (this.fps >= 30) {
            return { text: 'MEDIUM', class: 'perf-warning' };
        } else {
            return { text: 'POOR', class: 'perf-bad' };
        }
    }

    getReport() {
        return {
            fps: this.fps,
            avgFps: Math.round(this.metrics.avgFps),
            minFps: this.metrics.minFps,
            maxFps: this.metrics.maxFps,
            frameTime: Math.round(this.frameTime * 100) / 100,
            entityCount: this.entityCount,
            memoryUsage: this.metrics.memoryUsage,
            status: this.getPerformanceStatus().text
        };
    }
}

export default PerformanceMonitor;