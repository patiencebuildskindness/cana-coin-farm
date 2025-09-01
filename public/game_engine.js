// CANA Game Engine - Makes everything actually work

class CANAGameEngine {
    constructor() {
        this.canvas = document.getElementById('farmCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 12;
        this.tileSize = 50;
        this.selectedX = 0;
        this.selectedY = 0;
        this.selectedPlant = null;
        
        // Game data
        this.plots = [];
        this.day = 1;
        this.season = 'Spring';
        this.coins = 500;
        this.canaTokens = 0;
        this.energy = 100;
        this.inventory = {};
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Initialize plot grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.plots.push({
                    x: x,
                    y: y,
                    tilled: false,
                    plant: null,
                    plantData: null,
                    growth: 0,
                    watered: false,
                    health: 100,
                    ready: false
                });
            }
        }
        
        // Give starter seeds
        this.inventory = {
            tomato: 10,
            carrot: 10,
            lettuce: 10,
            lavender: 5,
            ginseng: 2
        };
        
        // Setup canvas click
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Setup keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Start render loop
        this.render();
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize);
        const y = Math.floor((e.clientY - rect.top) / this.tileSize);
        
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.selectedX = x;
            this.selectedY = y;
            
            // Auto-plant if seed selected
            if (this.selectedPlant) {
                this.plantSeed();
            }
            
            this.render();
            this.updatePlotInfo();
        }
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowUp': if (this.selectedY > 0) this.selectedY--; break;
            case 'ArrowDown': if (this.selectedY < this.gridSize - 1) this.selectedY++; break;
            case 'ArrowLeft': if (this.selectedX > 0) this.selectedX--; break;
            case 'ArrowRight': if (this.selectedX < this.gridSize - 1) this.selectedX++; break;
            case ' ': this.plantSeed(); break;
            case 'w': this.waterPlot(); break;
            case 'h': this.harvestPlot(); break;
            case 't': this.tillPlot(); break;
        }
        this.render();
        this.updatePlotInfo();
    }
    
    getPlot(x, y) {
        return this.plots.find(p => p.x === x && p.y === y);
    }
    
    tillPlot() {
        const plot = this.getPlot(this.selectedX, this.selectedY);
        if (plot && !plot.plant && this.energy >= 5) {
            plot.tilled = true;
            this.energy -= 5;
            this.updateStats();
            this.showMessage('Tilled soil');
            this.render();
        }
    }
    
    plantSeed() {
        const plot = this.getPlot(this.selectedX, this.selectedY);
        if (!plot || !plot.tilled || plot.plant || !this.selectedPlant) return;
        
        if (this.inventory[this.selectedPlant] > 0) {
            // Get plant data
            let plantData = null;
            for (let family in PLANT_DATABASE.families) {
                if (PLANT_DATABASE.families[family][this.selectedPlant]) {
                    plantData = PLANT_DATABASE.families[family][this.selectedPlant];
                    break;
                }
            }
            
            if (plantData) {
                plot.plant = this.selectedPlant;
                plot.plantData = plantData;
                plot.growth = 0;
                plot.ready = false;
                plot.health = 100;
                
                this.inventory[this.selectedPlant]--;
                if (this.inventory[this.selectedPlant] === 0) {
                    delete this.inventory[this.selectedPlant];
                    this.selectedPlant = null;
                }
                
                this.showMessage('Planted ' + plantData.name);
                this.updateInventory();
                this.render();
            }
        }
    }
    
    waterPlot() {
        const plot = this.getPlot(this.selectedX, this.selectedY);
        if (plot && plot.plant && !plot.watered && this.energy >= 2) {
            plot.watered = true;
            this.energy -= 2;
            this.updateStats();
            this.showMessage('Watered ' + plot.plantData.name);
            this.render();
        }
    }
    
    harvestPlot() {
        const plot = this.getPlot(this.selectedX, this.selectedY);
        if (plot && plot.ready) {
            const value = plot.plantData.basePrice;
            this.coins += value;
            
            // Chance for seeds
            if (Math.random() > 0.5) {
                this.inventory[plot.plant] = (this.inventory[plot.plant] || 0) + 2;
            }
            
            this.showMessage('Harvested ' + plot.plantData.name + ' for $' + value);
            
            plot.plant = null;
            plot.plantData = null;
            plot.growth = 0;
            plot.ready = false;
            plot.tilled = false;
            
            this.updateStats();
            this.updateInventory();
            this.render();
        }
    }
    
    nextDay() {
        this.day++;
        this.energy = 100;
        
        // Apply weather
        const weather = weatherBiome.getTodaysWeather();
        const isRaining = weather.weather === 'rainy';
        
        // Grow plants
        this.plots.forEach(plot => {
            if (plot.plant) {
                // Auto-water if raining
                if (isRaining) plot.watered = true;
                
                if (plot.watered) {
                    plot.growth++;
                    if (plot.growth >= plot.plantData.growthTime) {
                        plot.ready = true;
                    }
                } else {
                    plot.health -= 20;
                    if (plot.health <= 0) {
                        plot.plant = null;
                        plot.plantData = null;
                    }
                }
                plot.watered = false;
            }
        });
        
        // Change season
        if (this.day % 30 === 0) {
            const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
            const idx = seasons.indexOf(this.season);
            this.season = seasons[(idx + 1) % 4];
        }
        
        this.updateStats();
        this.render();
        this.showMessage('Day ' + this.day + (isRaining ? ' - It rained!' : ''));
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw plots
        this.plots.forEach(plot => {
            const x = plot.x * this.tileSize;
            const y = plot.y * this.tileSize;
            
            // Soil color
            if (plot.tilled) {
                this.ctx.fillStyle = '#8B4513';
            } else {
                this.ctx.fillStyle = '#90EE90';
            }
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            
            // Watered effect
            if (plot.watered) {
                this.ctx.fillStyle = 'rgba(0, 100, 200, 0.3)';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            }
            
            // Plant
            if (plot.plant && plot.plantData) {
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                if (plot.ready) {
                    // Show plant emoji
                    this.ctx.fillText(plot.plantData.emoji, x + this.tileSize/2, y + this.tileSize/2);
                    // Ready sparkle
                    this.ctx.font = '15px Arial';
                    this.ctx.fillText('✨', x + this.tileSize - 10, y + 10);
                } else {
                    // Growth stages
                    const growthPercent = plot.growth / plot.plantData.growthTime;
                    if (growthPercent < 0.33) {
                        this.ctx.fillText('🌱', x + this.tileSize/2, y + this.tileSize/2);
                    } else if (growthPercent < 0.66) {
                        this.ctx.fillText('🌿', x + this.tileSize/2, y + this.tileSize/2);
                    } else {
                        this.ctx.font = '25px Arial';
                        this.ctx.fillText('🌿', x + this.tileSize/2, y + this.tileSize/2);
                    }
                }
                
                // Health bar
                if (plot.health < 100) {
                    this.ctx.fillStyle = 'red';
                    this.ctx.fillRect(x + 5, y + this.tileSize - 5, (this.tileSize - 10) * (plot.health/100), 3);
                }
            }
            
            // Grid lines
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        });
        
        // Selection highlight
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.selectedX * this.tileSize, this.selectedY * this.tileSize, this.tileSize, this.tileSize);
    }
    
    updateStats() {
        document.getElementById('day').textContent = this.day;
        document.getElementById('season').textContent = this.season;
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('cana').textContent = this.canaTokens;
        document.getElementById('energy').textContent = this.energy;
    }
    
    updateInventory() {
        const container = document.getElementById('inventoryContainer');
        if (!container) return;
        
        container.innerHTML = '';
        Object.entries(this.inventory).forEach(([plant, count]) => {
            const div = document.createElement('div');
            div.className = 'inventoryItem';
            if (this.selectedPlant === plant) {
                div.classList.add('selected');
            }
            
            // Find plant data
            let plantData = null;
            for (let family in PLANT_DATABASE.families) {
                if (PLANT_DATABASE.families[family][plant]) {
                    plantData = PLANT_DATABASE.families[family][plant];
                    break;
                }
            }
            
            if (plantData) {
                div.innerHTML = plantData.emoji + '<br>' + plantData.name + '<br>x' + count;
                div.onclick = () => {
                    this.selectedPlant = plant;
                    this.updateInventory();
                };
                container.appendChild(div);
            }
        });
    }
    
    updatePlotInfo() {
        const plot = this.getPlot(this.selectedX, this.selectedY);
        const info = document.getElementById('plotInfo');
        if (!info) return;
        
        let html = `Position: (${this.selectedX}, ${this.selectedY})<br>`;
        
        if (plot) {
            html += `Tilled: ${plot.tilled ? 'Yes' : 'No'}<br>`;
            
            if (plot.plant && plot.plantData) {
                html += `Plant: ${plot.plantData.name}<br>`;
                html += `Growth: ${plot.growth}/${plot.plantData.growthTime} days<br>`;
                html += `Health: ${plot.health}%<br>`;
                html += `Watered: ${plot.watered ? 'Yes' : 'No'}<br>`;
                html += `Ready: ${plot.ready ? 'Yes! Harvest it!' : 'No'}`;
            }
        }
        
        info.innerHTML = html;
    }
    
    showMessage(text) {
        const msg = document.getElementById('statusMessage');
        if (msg) {
            msg.textContent = text;
            msg.style.display = 'block';
            setTimeout(() => {
                msg.style.display = 'none';
            }, 3000);
        }
    }
    
    buySeeds(plantKey) {
        let plantData = null;
        for (let family in PLANT_DATABASE.families) {
            if (PLANT_DATABASE.families[family][plantKey]) {
                plantData = PLANT_DATABASE.families[family][plantKey];
                break;
            }
        }
        
        if (plantData && this.coins >= plantData.seedCost) {
            this.coins -= plantData.seedCost;
            this.inventory[plantKey] = (this.inventory[plantKey] || 0) + 5;
            this.updateStats();
            this.updateInventory();
            this.showMessage('Bought ' + plantData.name + ' seeds');
        }
    }
}

// Initialize game when ready
let gameEngine = null;
window.addEventListener('load', () => {
    setTimeout(() => {
        gameEngine = new CANAGameEngine();
        gameEngine.updateStats();
        gameEngine.updateInventory();
        window.gameEngine = gameEngine;
    }, 100);
});
