// Wait for everything to load
window.addEventListener('load', function() {
    console.log('[Save Integration] Initializing for CANA game...');
    
    // Your game uses gameState, not game
    if (typeof gameState === 'undefined') {
        console.error('[Save Integration] gameState not found!');
        return;
    }
    
    // CRITICAL FIX: Map gameState to game for saveSystem compatibility
    window.game = gameState;
    
    // Hook into your existing saveGame function
    if (typeof saveGame === 'function') {
        const originalSaveGame = window.saveGame;
        window.saveGame = function() {
            // Call original save
            if (originalSaveGame) {
                originalSaveGame.apply(this, arguments);
            }
            
            // Also trigger saveSystem
            if (window.saveSystem) {
                // Update the game reference
                window.game = gameState;
                console.log('[Save Integration] Syncing with SaveSystem...');
            }
        };
    }
    
    // Hook into plantCrop
    if (typeof plantCrop === 'function') {
        const originalPlantCrop = window.plantCrop;
        window.plantCrop = function(...args) {
            const result = originalPlantCrop.apply(this, args);
            window.game = gameState; // Ensure sync
            if (window.saveSystem) {
                saveSystem.save();
            }
            return result;
        };
    }
    
    // Hook into harvestCrop
    if (typeof harvestCrop === 'function') {
        const originalHarvestCrop = window.harvestCrop;
        window.harvestCrop = function(...args) {
            const result = originalHarvestCrop.apply(this, args);
            window.game = gameState; // Ensure sync
            if (window.saveSystem) {
                saveSystem.save();
            }
            return result;
        };
    }
    
    // Fix the game object structure to match what saveSystem expects
    window.game = {
        // Map your gameState properties to what saveSystem expects
        character: {
            x: 5,
            y: 5,
            energy: gameState.energy || 100,
            inventory: gameState.inventory || {}
        },
        
        // Grid data - map your plots array to grid structure
        grid: {
            plots: []
        },
        
        // Direct mappings
        day: 1,
        season: 'Spring',
        coins: gameState.coins || 1000,
        experience: gameState.xp || 0,
        gridSize: 8, // Your game uses 8x8 grid
        
        // Your specific game data
        level: gameState.level || 1,
        gems: gameState.gems || 10,
        herbs: gameState.herbs || 0,
        extracts: gameState.extracts || 0,
        energy: gameState.energy || 100,
        maxEnergy: gameState.maxEnergy || 100,
        
        // Map plots to grid format
        inventory: gameState.inventory || {},
        processedInventory: {},
        marketPrices: {},
        
        stats: {
            plantsPlanted: 0,
            plantsHarvested: 0,
            totalEarnings: 0,
            discoveries: 0
        },
        
        buildings: gameState.buildings || {},
        achievements: [],
        questProgress: {},
        settings: {},
        
        // Keep reference to original plots
        plots: gameState.plots || []
    };
    
    // Convert plots array to grid format for saveSystem
    const gridSize = 8;
    for (let y = 0; y < gridSize; y++) {
        window.game.grid.plots[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const plotIndex = y * gridSize + x;
            window.game.grid.plots[y][x] = {
                x: x,
                y: y,
                plant: gameState.plots[plotIndex]?.plant?.name || null,
                tilled: gameState.plots[plotIndex] !== null,
                watered: false,
                fertilized: false,
                health: 100,
                originalData: gameState.plots[plotIndex]
            };
        }
    }
    
    // Override saveSystem's save to sync with gameState
    if (window.saveSystem) {
        const originalSave = saveSystem.save.bind(saveSystem);
        saveSystem.save = function() {
            // Sync game object with current gameState
            window.game.coins = gameState.coins;
            window.game.level = gameState.level;
            window.game.experience = gameState.xp;
            window.game.character.energy = gameState.energy;
            window.game.herbs = gameState.herbs;
            window.game.gems = gameState.gems;
            window.game.extracts = gameState.extracts;
            window.game.plots = gameState.plots;
            
            // Call original save
            return originalSave();
        };
        
        // Override load to sync back to gameState
        const originalLoad = saveSystem.load.bind(saveSystem);
        saveSystem.load = function() {
            const result = originalLoad();
            
            if (result && window.game) {
                // Sync loaded data back to gameState
                gameState.coins = window.game.coins || gameState.coins;
                gameState.level = window.game.level || gameState.level;
                gameState.xp = window.game.experience || gameState.xp;
                gameState.energy = window.game.character?.energy || gameState.energy;
                gameState.herbs = window.game.herbs || gameState.herbs;
                gameState.gems = window.game.gems || gameState.gems;
                gameState.extracts = window.game.extracts || gameState.extracts;
                
                // Update UI with loaded values
                if (typeof updateUI === 'function') {
                    updateUI();
                }
                
                // Reinitialize farm grid with loaded data
                if (typeof initFarmGrid === 'function') {
                    initFarmGrid();
                }
            }
            
            return result;
        };
        
        // Initialize the save system UI
        console.log('[Save Integration] Initializing SaveSystem UI...');
        if (!document.getElementById('save-system-ui')) {
            saveSystem.createUI();
        }
    }
    
    // Debug check
    setTimeout(() => {
        if (!document.getElementById('save-system-ui')) {
            console.error('[Save Integration] Save UI not created! Attempting manual creation...');
            if (window.saveSystem && typeof saveSystem.createUI === 'function') {
                saveSystem.createUI();
            }
        } else {
            console.log('[Save Integration] ✅ Save UI is visible!');
        }
    }, 1000);
    
    console.log('[Save Integration] ✅ Integration complete!');
    console.log('[Save Integration] The save UI should appear in top-right corner');
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (window.saveSystem) {
            window.game = gameState; // Ensure sync
            saveSystem.save();
        }
    }
    
    // Ctrl+L to load
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (window.saveSystem) {
            saveSystem.load();
        }
    }
});

console.log('[Save Integration] Script loaded! Waiting for page load...');
