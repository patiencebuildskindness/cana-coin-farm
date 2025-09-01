// CANA Multiplayer Visiting System
// Visit friends' farms, help them, earn rewards

class MultiplayerVisiting {
    constructor() {
        this.myFarmId = localStorage.getItem('farmId') || this.generateFarmId();
        this.visitingFarm = null;
        this.friends = [];
        this.visitors = [];
        this.helpActions = {
            water: { energy: 5, reward: 2 },
            harvest: { energy: 10, reward: 5 },
            fertilize: { energy: 8, reward: 4 },
            clearWeeds: { energy: 3, reward: 1 }
        };
        this.dailyVisitRewards = new Map();
    }
    
    generateFarmId() {
        const id = 'farm_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('farmId', id);
        return id;
    }
    
    // Visit a friend's farm
    visitFarm(friendId) {
        this.visitingFarm = friendId;
        
        // Load friend's farm data (simulated for now)
        const friendFarm = {
            id: friendId,
            owner: 'Friend_' + friendId.substr(-4),
            level: Math.floor(Math.random() * 20) + 1,
            plants: this.generateRandomFarm(),
            needsHelp: Math.random() > 0.3
        };
        
        this.displayVisitingFarm(friendFarm);
        return friendFarm;
    }
    
    // Generate random farm for visiting
    generateRandomFarm() {
        const plants = [];
        const plantTypes = ['tomato', 'carrot', 'ginseng', 'lavender', 'echinacea'];
        
        for (let i = 0; i < 20; i++) {
            plants.push({
                type: plantTypes[Math.floor(Math.random() * plantTypes.length)],
                needsWater: Math.random() > 0.5,
                readyToHarvest: Math.random() > 0.7,
                hasWeeds: Math.random() > 0.8,
                x: Math.floor(Math.random() * 10),
                y: Math.floor(Math.random() * 10)
            });
        }
        return plants;
    }
    
    // Help on friend's farm
    helpFriend(action, plantIndex) {
        const help = this.helpActions[action];
        if (!help) return false;
        
        // Check daily limit
        const today = new Date().toDateString();
        const key = this.visitingFarm + '_' + today;
        const helpCount = this.dailyVisitRewards.get(key) || 0;
        
        if (helpCount >= 5) {
            return { success: false, message: 'Daily help limit reached for this farm' };
        }
        
        // Perform help action
        this.dailyVisitRewards.set(key, helpCount + 1);
        
        // Reward player
        const reward = {
            coins: help.reward * 10,
            cana: help.reward,
            reputation: 1
        };
        
        if (window.gameState) {
            window.gameState.economy.coins += reward.coins;
            window.gameState.economy.canaTokens += reward.cana;
            window.gameState.social.reputation = (window.gameState.social.reputation || 0) + 1;
        }
        
        return {
            success: true,
            reward: reward,
            message: 'Helped friend! +' + reward.coins + ' coins, +' + reward.cana + ' CANA'
        };
    }
    
    // Display visiting farm UI
    displayVisitingFarm(farm) {
        const visitUI = document.createElement('div');
        visitUI.id = 'visitingFarmUI';
        visitUI.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:2000;display:flex;align-items:center;justify-content:center;';
        
        const farmDisplay = document.createElement('div');
        farmDisplay.style.cssText = 'background:white;padding:30px;border-radius:20px;max-width:800px;max-height:80vh;overflow-y:auto;';
        
        farmDisplay.innerHTML = `
            <h2>🚜 Visiting ${farm.owner}'s Farm (Level ${farm.level})</h2>
            <div id="visitCanvas" style="width:500px;height:500px;background:#8bc34a;border:3px solid #333;border-radius:10px;position:relative;">
                ${farm.plants.map((plant, idx) => `
                    <div style="position:absolute;left:${plant.x * 50}px;top:${plant.y * 50}px;width:50px;height:50px;text-align:center;line-height:50px;font-size:24px;cursor:pointer;" 
                         onclick="multiplayerVisit.helpPlant(${idx}, '${plant.needsWater ? 'water' : plant.readyToHarvest ? 'harvest' : 'clearWeeds'}')">
                        ${plant.readyToHarvest ? '🌾' : '🌱'}
                        ${plant.needsWater ? '💧' : ''}
                        ${plant.hasWeeds ? '🌿' : ''}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:20px;">
                <h3>Available Actions:</h3>
                <button onclick="multiplayerVisit.helpAllPlants('water')">💧 Water All (5 energy each)</button>
                <button onclick="multiplayerVisit.helpAllPlants('harvest')">🌾 Harvest All (10 energy each)</button>
                <button onclick="multiplayerVisit.leaveFarm()">🏠 Return Home</button>
            </div>
            <div id="visitRewards" style="margin-top:20px;padding:10px;background:#e8f5e9;border-radius:10px;"></div>
        `;
        
        visitUI.appendChild(farmDisplay);
        document.body.appendChild(visitUI);
    }
    
    // Help specific plant
    helpPlant(plantIndex, action) {
        const result = this.helpFriend(action, plantIndex);
        if (result.success) {
            document.getElementById('visitRewards').innerHTML += 
                '<div>' + result.message + '</div>';
        } else {
            alert(result.message);
        }
    }
    
    // Help all plants
    helpAllPlants(action) {
        let totalReward = { coins: 0, cana: 0 };
        let helpCount = 0;
        
        // Simulate helping multiple plants
        for (let i = 0; i < 5; i++) {
            const result = this.helpFriend(action, i);
            if (result.success) {
                totalReward.coins += result.reward.coins;
                totalReward.cana += result.reward.cana;
                helpCount++;
            } else {
                break;
            }
        }
        
        if (helpCount > 0) {
            document.getElementById('visitRewards').innerHTML = 
                '<div>Helped ' + helpCount + ' plants! Total: +' + 
                totalReward.coins + ' coins, +' + totalReward.cana + ' CANA</div>';
        }
    }
    
    // Leave farm and return home
    leaveFarm() {
        this.visitingFarm = null;
        document.getElementById('visitingFarmUI').remove();
        if (window.updateStats) window.updateStats();
    }
    
    // Add friend
    addFriend(friendCode) {
        if (!this.friends.includes(friendCode)) {
            this.friends.push(friendCode);
            localStorage.setItem('friends', JSON.stringify(this.friends));
            return true;
        }
        return false;
    }
    
    // Get friend list
    getFriends() {
        const saved = localStorage.getItem('friends');
        if (saved) {
            this.friends = JSON.parse(saved);
        }
        return this.friends;
    }
}

const multiplayerVisit = new MultiplayerVisiting();
