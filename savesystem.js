/**
 * SAVE SYSTEM FOR CANA COIN FARM
 * Copy this entire file and save it as saveSystem.js
 * Then include it in your HTML: <script src="saveSystem.js"></script>
 */

// ============================================
// SAVE SYSTEM CLASS - Handles all save/load operations
// ============================================
class SaveSystem {
    constructor() {
        this.saveKey = 'CANAFarmSave';
        this.backupKey = 'CANAFarmBackup';
        this.autoSaveInterval = null;
        this.lastSaveTime = null;
        
        // Add disclaimer
        this.disclaimer = "⚠️ This is an educational game only. Not financial or investment advice.";
    }
    
    /**
     * Initialize the save system
     * Call this when your game starts
     */
    init() {
        console.log('[SaveSystem] Initializing...');
        
        // Add save/load buttons to the page
        this.createUI();
        
        // Start auto-save (every 60 seconds)
        this.startAutoSave();
        
        // Try to load existing save
        const loaded = this.load();
        if (loaded) {
            this.showMessage('✅ Game loaded successfully!', 'success');
        } else {
            this.showMessage('🆕 Starting new game', 'info');
        }
    }
    
    /**
     * MAIN SAVE FUNCTION
     * Saves all game data to localStorage
     */
    save() {
        try {
            console.log('[SaveSystem] Starting save...');
            
            // Create save object with ALL game data
            const saveData = {
                // Metadata
                version: '1.3.0',
                timestamp: Date.now(),
                saveDate: new Date().toISOString(),
                
                // Character data
                character: {
                    x: game?.character?.x || 5,
                    y: game?.character?.y || 5,
                    energy: game?.character?.energy || 100,
                    inventory: game?.character?.inventory || {}
                },
                
                // Game state
                gameState: {
                    day: game?.day || 1,
                    season: game?.season || 'Spring',
                    coins: game?.coins || 100,
                    experience: game?.experience || 0,
                    gridSize: game?.gridSize || 10
                },
                
                // Grid/Plots data
                plots: this.savePlots(),
                
                // Inventory
                inventory: game?.inventory || {},
                processedInventory: game?.processedInventory || {},
                
                // Market data
                marketPrices: game?.marketPrices || {},
                
                // Stats
                stats: {
                    plantsPlanted: game?.stats?.plantsPlanted || 0,
                    plantsHarvested: game?.stats?.plantsHarvested || 0,
                    totalEarnings: game?.stats?.totalEarnings || 0,
                    discoveries: game?.discoveries || 0
                },
                
                // Buildings (if you have them)
                buildings: game?.buildings || [],
                
                // Any other game data
                achievements: game?.achievements || [],
                questProgress: game?.questProgress || {},
                settings: game?.settings || {}
            };
            
            // Convert to JSON string
            const saveString = JSON.stringify(saveData);
            
            // Save to localStorage
            localStorage.setItem(this.saveKey, saveString);
            
            // Create backup
            localStorage.setItem(this.backupKey, saveString);
            
            // Update last save time
            this.lastSaveTime = Date.now();
            
            // Show success message
            this.showMessage('✅ Game saved!', 'success');
            
            console.log('[SaveSystem] Save complete!', saveData);
            return true;
            
        } catch (error) {
            console.error('[SaveSystem] Save failed:', error);
            this.showMessage('❌ Save failed! ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * MAIN LOAD FUNCTION
     * Loads game data from localStorage
     */
    load() {
        try {
            console.log('[SaveSystem] Loading save...');
            
            // Get save data from localStorage
            const saveString = localStorage.getItem(this.saveKey);
            
            if (!saveString) {
                console.log('[SaveSystem] No save found');
                return false;
            }
            
            // Parse save data
            const saveData = JSON.parse(saveString);
            
            console.log('[SaveSystem] Found save from:', saveData.saveDate);
            
            // Restore character
            if (game?.character && saveData.character) {
                game.character.x = saveData.character.x;
                game.character.y = saveData.character.y;
                game.character.energy = saveData.character.energy;
                game.character.inventory = saveData.character.inventory;
            }
            
            // Restore game state
            if (game && saveData.gameState) {
                game.day = saveData.gameState.day;
                game.season = saveData.gameState.season;
                game.coins = saveData.gameState.coins;
                game.experience = saveData.gameState.experience;
                game.gridSize = saveData.gameState.gridSize;
            }
            
            // Restore plots
            if (saveData.plots) {
                this.loadPlots(saveData.plots);
            }
            
            // Restore inventories
            if (game) {
                game.inventory = saveData.inventory || {};
                game.processedInventory = saveData.processedInventory || {};
                game.marketPrices = saveData.marketPrices || {};
            }
            
            // Restore stats
            if (game && saveData.stats) {
                game.stats = saveData.stats;
            }
            
            // Restore other data
            if (game) {
                game.buildings = saveData.buildings || [];
                game.achievements = saveData.achievements || [];
                game.questProgress = saveData.questProgress || {};
                game.settings = saveData.settings || {};
                game.discoveries = saveData.stats?.discoveries || 0;
            }
            
            console.log('[SaveSystem] Load complete!');
            
            // Redraw the game
            if (typeof renderGame === 'function') {
                renderGame();
            }
            
            return true;
            
        } catch (error) {
            console.error('[SaveSystem] Load failed:', error);
            
            // Try backup
            if (this.loadBackup()) {
                this.showMessage('⚠️ Loaded from backup', 'warning');
                return true;
            }
            
            this.showMessage('❌ Load failed! ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * Save all plot data
     */
    savePlots() {
        const plotData = [];
        
        if (!game?.grid?.plots) return plotData;
        
        // Save each plot
        for (let y = 0; y < game.gridSize; y++) {
            for (let x = 0; x < game.gridSize; x++) {
                const plot = game.grid.plots[y]?.[x];
                if (plot && (plot.plant || plot.tilled)) {
                    plotData.push({
                        x: x,
                        y: y,
                        plant: plot.plant,
                        plantedDay: plot.plantedDay,
                        watered: plot.watered,
                        lastWatered: plot.lastWatered,
                        health: plot.health,
                        growthStage: plot.growthStage,
                        tilled: plot.tilled,
                        fertilized: plot.fertilized,
                        soil: plot.soil
                    });
                }
            }
        }
        
        return plotData;
    }
    
    /**
     * Load plot data
     */
    loadPlots(plotData) {
        if (!game?.grid?.plots || !plotData) return;
        
        // Clear existing plots first
        for (let y = 0; y < game.gridSize; y++) {
            for (let x = 0; x < game.gridSize; x++) {
                if (game.grid.plots[y] && game.grid.plots[y][x]) {
                    game.grid.plots[y][x].plant = null;
                    game.grid.plots[y][x].tilled = false;
                }
            }
        }
        
        // Restore saved plots
        plotData.forEach(plotInfo => {
            const plot = game.grid.plots[plotInfo.y]?.[plotInfo.x];
            if (plot) {
                plot.plant = plotInfo.plant;
                plot.plantedDay = plotInfo.plantedDay;
                plot.watered = plotInfo.watered;
                plot.lastWatered = plotInfo.lastWatered;
                plot.health = plotInfo.health;
                plot.growthStage = plotInfo.growthStage;
                plot.tilled = plotInfo.tilled;
                plot.fertilized = plotInfo.fertilized;
                if (plotInfo.soil) {
                    plot.soil = plotInfo.soil;
                }
            }
        });
    }
    
    /**
     * Load from backup
     */
    loadBackup() {
        try {
            const backupString = localStorage.getItem(this.backupKey);
            if (backupString) {
                localStorage.setItem(this.saveKey, backupString);
                return this.load();
            }
        } catch (error) {
            console.error('[SaveSystem] Backup load failed:', error);
        }
        return false;
    }
    
    /**
     * Delete save data
     */
    deleteSave() {
        if (confirm('⚠️ Are you sure you want to delete your save? This cannot be undone!')) {
            try {
                localStorage.removeItem(this.saveKey);
                localStorage.removeItem(this.backupKey);
                this.showMessage('🗑️ Save deleted', 'info');
                
                // Reload the page to start fresh
                setTimeout(() => {
                    location.reload();
                }, 1000);
                
                return true;
            } catch (error) {
                console.error('[SaveSystem] Delete failed:', error);
                this.showMessage('❌ Delete failed!', 'error');
                return false;
            }
        }
        return false;
    }
    
    /**
     * Export save as file
     */
    exportSave() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                this.showMessage('❌ No save to export!', 'error');
                return;
            }
            
            // Create blob and download link
            const blob = new Blob([saveString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CANAFarm_Save_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            this.showMessage('✅ Save exported!', 'success');
            
        } catch (error) {
            console.error('[SaveSystem] Export failed:', error);
            this.showMessage('❌ Export failed!', 'error');
        }
    }
    
    /**
     * Import save from file
     */
    importSave(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const saveString = e.target.result;
                const saveData = JSON.parse(saveString); // Validate JSON
                
                // Save to localStorage
                localStorage.setItem(this.saveKey, saveString);
                
                // Load the save
                this.load();
                
                this.showMessage('✅ Save imported!', 'success');
                
                // Refresh page
                setTimeout(() => {
                    location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('[SaveSystem] Import failed:', error);
                this.showMessage('❌ Invalid save file!', 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Start auto-save timer
     */
    startAutoSave() {
        // Clear existing interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Save every 60 seconds
        this.autoSaveInterval = setInterval(() => {
            console.log('[SaveSystem] Auto-saving...');
            this.save();
        }, 60000); // 60 seconds
        
        console.log('[SaveSystem] Auto-save enabled (60 seconds)');
    }
    
    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('[SaveSystem] Auto-save disabled');
        }
    }
    
    /**
     * Create UI buttons
     */
    createUI() {
        // Check if UI already exists
        if (document.getElementById('save-system-ui')) return;
        
        // Create UI container
        const uiHTML = `
            <div id="save-system-ui" style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.95);
                border: 2px solid #4CAF50;
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                <div style="font-weight: bold; margin-bottom: 8px;">
                    💾 Save System
                </div>
                
                <button onclick="saveSystem.save()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                ">💾 Save Game</button>
                
                <button onclick="saveSystem.load()" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                ">📂 Load Game</button>
                
                <button onclick="saveSystem.exportSave()" style="
                    background: #FF9800;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                ">⬇️ Export</button>
                
                <input type="file" id="import-save-file" accept=".json" style="display: none;" 
                    onchange="saveSystem.importSave(this.files[0])">
                
                <button onclick="document.getElementById('import-save-file').click()" style="
                    background: #9C27B0;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                ">⬆️ Import</button>
                
                <button onclick="saveSystem.deleteSave()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                ">🗑️ Delete</button>
                
                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                    Auto-save: Every 60 seconds<br>
                    <span id="last-save-time">Never saved</span>
                </div>
                
                <div style="margin-top: 8px; font-size: 10px; color: #999;">
                    ${this.disclaimer}
                </div>
            </div>
            
            <div id="save-message" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10001;
                display: none;
                font-family: Arial, sans-serif;
                text-align: center;
            "></div>
        `;
        
        // Add to page
        const div = document.createElement('div');
        div.innerHTML = uiHTML;
        document.body.appendChild(div);
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('save-message');
        if (!messageEl) return;
        
        // Set color based on type
        const colors = {
            'success': '#4CAF50',
            'error': '#f44336',
            'warning': '#FF9800',
            'info': '#2196F3'
        };
        
        messageEl.style.borderLeft = `5px solid ${colors[type]}`;
        messageEl.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${message}</div>
            <div style="font-size: 12px; color: #666;">
                ${new Date().toLocaleTimeString()}
            </div>
        `;
        messageEl.style.display = 'block';
        
        // Update last save time if success
        if (type === 'success' && message.includes('saved')) {
            const lastSaveEl = document.getElementById('last-save-time');
            if (lastSaveEl) {
                lastSaveEl.textContent = `Last save: ${new Date().toLocaleTimeString()}`;
            }
        }
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// ============================================
// CREATE GLOBAL INSTANCE
// ============================================
const saveSystem = new SaveSystem();

// ============================================
// AUTO-INITIALIZE WHEN PAGE LOADS
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        saveSystem.init();
    });
} else {
    // Page already loaded
    saveSystem.init();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSystem.save();
    }
    
    // Ctrl+L or Cmd+L to load
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        saveSystem.load();
    }
});

// ============================================
// SAVE BEFORE PAGE UNLOAD
// ============================================
window.addEventListener('beforeunload', (e) => {
    saveSystem.save();
});

console.log('[SaveSystem] Script loaded! Use saveSystem.save() and saveSystem.load()');
