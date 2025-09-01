// Working Market System

function openMarket() {
    const marketUI = document.createElement('div');
    marketUI.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:3000;display:flex;align-items:center;justify-content:center;';
    
    const marketContent = document.createElement('div');
    marketContent.style.cssText = 'background:white;padding:30px;border-radius:20px;max-width:90%;max-height:80vh;overflow-y:auto;';
    
    let html = '<h2>🏪 Seed Market</h2>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:15px;">';
    
    // Add all plants from database
    Object.entries(PLANT_DATABASE.families).forEach(([family, plants]) => {
        Object.entries(plants).forEach(([key, plant]) => {
            const canAfford = gameEngine.coins >= plant.seedCost;
            html += `
                <div style="padding:15px;border:2px solid ${canAfford ? '#4caf50' : '#ccc'};border-radius:10px;text-align:center;${!canAfford ? 'opacity:0.5;' : ''}">
                    <div style="font-size:30px;">${plant.emoji}</div>
                    <div><b>${plant.name}</b></div>
                    <div style="font-size:12px;color:#666;">Grow: ${plant.growthTime} days</div>
                    <div style="font-size:12px;color:#666;">Sell: $${plant.basePrice}</div>
                    <div style="margin:10px 0;">💰 ${plant.seedCost} coins</div>
                    <button onclick="gameEngine.buySeeds('${key}');this.parentElement.style.backgroundColor='#e8f5e9';" ${!canAfford ? 'disabled' : ''}>
                        Buy Seeds
                    </button>
                </div>
            `;
        });
    });
    
    html += '</div>';
    html += '<button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px;width:100%;">Close Market</button>';
    
    marketContent.innerHTML = html;
    marketUI.appendChild(marketContent);
    document.body.appendChild(marketUI);
}

// Quick action buttons
function waterAll() {
    let watered = 0;
    gameEngine.plots.forEach(plot => {
        if (plot.plant && !plot.watered && gameEngine.energy >= 2) {
            plot.watered = true;
            gameEngine.energy -= 2;
            watered++;
        }
    });
    gameEngine.updateStats();
    gameEngine.render();
    gameEngine.showMessage('Watered ' + watered + ' plants');
}

function harvestAll() {
    let harvested = 0;
    let totalCoins = 0;
    gameEngine.plots.forEach(plot => {
        if (plot.ready) {
            totalCoins += plot.plantData.basePrice;
            gameEngine.coins += plot.plantData.basePrice;
            
            // Chance for seeds
            if (Math.random() > 0.5) {
                gameEngine.inventory[plot.plant] = (gameEngine.inventory[plot.plant] || 0) + 2;
            }
            
            plot.plant = null;
            plot.plantData = null;
            plot.growth = 0;
            plot.ready = false;
            plot.tilled = false;
            harvested++;
        }
    });
    
    if (harvested > 0) {
        gameEngine.updateStats();
        gameEngine.updateInventory();
        gameEngine.render();
        gameEngine.showMessage('Harvested ' + harvested + ' plants for $' + totalCoins);
    }
}
