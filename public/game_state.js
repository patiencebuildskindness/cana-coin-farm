// Game State Manager - Handles save/load and multiplayer sync

class GameState {
    constructor() {
        this.version = "2.0";
        this.playerId = this.generatePlayerId();
        this.farm = {
            plots: [],
            buildings: [],
            level: 1,
            size: 10
        };
        this.inventory = {
            seeds: {},
            produce: {},
            tools: {}
        };
        this.economy = {
            coins: 200,
            canaTokens: 0,
            reputation: 0
        };
        this.social = {
            friends: [],
            guild: null,
            visitorsToday: 0
        };
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    save() {
        const saveData = {
            version: this.version,
            playerId: this.playerId,
            farm: this.farm,
            inventory: this.inventory,
            economy: this.economy,
            social: this.social,
            timestamp: Date.now()
        };
        localStorage.setItem('cana_save', JSON.stringify(saveData));
        return saveData;
    }
    
    load() {
        const saveData = localStorage.getItem('cana_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            Object.assign(this, data);
            return true;
        }
        return false;
    }
    
    // For multiplayer sync
    async syncWithServer() {
        // Will connect to backend
        console.log('Ready for multiplayer sync');
    }
}

const gameState = new GameState();
