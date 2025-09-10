
// Wait for everything to load
window.addEventListener('load', function() {
    console.log('[Save Integration] Initializing...');
    
    // Make sure game object exists
    if (typeof game === 'undefined') {
        console.error('[Save Integration] Game object not found! Make sure your game script loads first.');
        
        // Try to find game object in window
        if (window.Game) {
            window.game = window.Game;
        } else if (window.GAME) {
            window.game = window.GAME;
        } else {
            console.error('[Save Integration] Could not find game object. Save system will not work properly.');
            return;
        }
    }
    
    // ============================================
    // HOOK INTO GAME FUNCTIONS
    // ============================================
    
    // Hook into coin updates
    if (typeof updateCoins === 'function') {
        const originalUpdateCoins = updateCoins;
        window.updateCoins = function(...args) {
            const result = originalUpdateCoins.apply(this, args);
            // Auto-save when coins change
            if (saveSystem) {
                console.log('[Save Integration] Coins updated, auto-saving...');
                saveSystem.save();
            }
            return result;
        };
    }
    
    // Hook into plant harvesting
    if (typeof harvestPlant === 'function') {
        const originalHarvest = harvestPlant;
        window.harvestPlant = function(...args) {
            const result = originalHarvest.apply(this, args);
            // Auto-save after harvest
            if (saveSystem) {
                console.log('[Save Integration] Plant harvested, auto-saving...');
                saveSystem.save();
            }
            return result;
        };
    }
    
    // Hook into planting
    if (typeof plantSeed === 'function') {
        const originalPlant = plantSeed;
        window.plantSeed = function(...args) {
            const result = originalPlant.apply(this, args);
            // Auto-save after planting
            if (saveSystem) {
                console.log('[Save Integration] Seed planted, auto-saving...');
                saveSystem.save();
            }
            return result;
        };
    }
    
    // Hook into day changes
    if (typeof nextDay === 'function') {
        const originalNextDay = nextDay;
        window.nextDay = function(...args) {
            const result = originalNextDay.apply(this, args);
            // Auto-save at end of day
            if (saveSystem) {
                console.log('[Save Integration] Day ended, auto-saving...');
                saveSystem.save();
            }
            return result;
        };
    }
    
    // ============================================
    // FIX GAME OBJECT REFERENCES
    // ============================================
    
    // Ensure game object has all needed properties
    if (window.game) {
        // Initialize missing properties with defaults
        game.character = game.character || {
            x: 5,
            y: 5,
            energy: 100,
            inventory: {}
        };
        
        game.grid = game.grid || {
            plots: []
        };
        
        game.inventory = game.inventory || {};
        game.processedInventory = game.processedInventory || {};
        game.marketPrices = game.marketPrices || {};
        
        game.stats = game.stats || {
            plantsPlanted: 0,
            plantsHarvested: 0,
            totalEarnings: 0
        };
        
        game.buildings = game.buildings || [];
        game.achievements = game.achievements || [];
        game.questProgress = game.questProgress || {};
        game.settings = game.settings || {};
        
        // Default values if not set
        game.day = game.day || 1;
        game.season = game.season || 'Spring';
        game.coins = game.coins || 100;
        game.experience = game.experience || 0;
        game.gridSize = game.gridSize || 10;
        game.discoveries = game.discoveries || 0;
        
        console.log('[Save Integration] Game object initialized:', game);
    }
    
    // ============================================
    // INITIALIZE GRID IF NEEDED
    // ============================================
    
    if (game && game.grid && !game.grid.plots.length) {
        game.grid.plots = [];
        for (let y = 0; y < game.gridSize; y++) {
            game.grid.plots[y] = [];
            for (let x = 0; x < game.gridSize; x++) {
                game.grid.plots[y][x] = {
                    x: x,
                    y: y,
                    plant: null,
                    tilled: false,
                    watered: false,
                    fertilized: false,
                    health: 100
                };
            }
        }
        console.log('[Save Integration] Grid initialized');
    }
    
    // ============================================
    // LOAD SAVED GAME ON START
    // ============================================
    
    setTimeout(() => {
        if (saveSystem) {
            console.log('[Save Integration] Attempting to load saved game...');
            const loaded = saveSystem.load();
            
            if (loaded) {
                console.log('[Save Integration] Save loaded successfully!');
                
                // Refresh display
                if (typeof renderGame === 'function') {
                    renderGame();
                } else if (typeof updateDisplay === 'function') {
                    updateDisplay();
                } else if (typeof draw === 'function') {
                    draw();
                }
                
                // Update UI elements
                updateUIElements();
            } else {
                console.log('[Save Integration] No save found, starting new game');
            }
        }
    }, 100);
    
    // ============================================
    // UI UPDATE HELPER
    // ============================================
    
    function updateUIElements() {
        // Update coin display
        const coinElements = document.querySelectorAll('#coins, .coins, .coin-display, .balance');
        coinElements.forEach(el => {
            if (game && game.coins !== undefined) {
                el.textContent = game.coins;
            }
        });
        
        // Update day display
        const dayElements = document.querySelectorAll('#day, .day, .day-display');
        dayElements.forEach(el => {
            if (game && game.day !== undefined) {
                el.textContent = 'Day ' + game.day;
            }
        });
        
        // Update season display
        const seasonElements = document.querySelectorAll('#season, .season, .season-display');
        seasonElements.forEach(el => {
            if (game && game.season) {
                el.textContent = game.season;
            }
        });
        
        // Update energy display
        const energyElements = document.querySelectorAll('#energy, .energy, .energy-display');
        energyElements.forEach(el => {
            if (game && game.character && game.character.energy !== undefined) {
                el.textContent = game.character.energy;
            }
        });
        
        // Update inventory displays
        if (typeof updateInventoryDisplay === 'function') {
            updateInventoryDisplay();
        }
    }
    
    // ============================================
    // ADD SAVE TRIGGERS TO COMMON EVENTS
    // ============================================
    
    // Save when clicking important buttons
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Check if clicked element is an important action
        const importantSelectors = [
            '.harvest', '.plant', '.water', '.till',
            '.buy', '.sell', '.upgrade', '.purchase',
            '.claim', '.collect', '.complete',
            'button[onclick*="harvest"]',
            'button[onclick*="plant"]',
            'button[onclick*="buy"]',
            'button[onclick*="sell"]'
        ];
        
        const isImportant = importantSelectors.some(selector => 
            target.matches(selector) || target.closest(selector)
        );
        
        if (isImportant) {
            setTimeout(() => {
                if (saveSystem) {
                    console.log('[Save Integration] Important action detected, saving...');
                    saveSystem.save();
                }
            }, 100);
        }
    });
    
    // ============================================
    // CANVAS CLICK HANDLER (for farming games)
    // ============================================
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.addEventListener('click', function() {
            // Save after canvas interactions
            setTimeout(() => {
                if (saveSystem) {
                    saveSystem.save();
                }
            }, 500);
        });
    }
    
    // ============================================
    // PERIODIC SAVE (backup to auto-save)
    // ============================================
    
    setInterval(() => {
        if (saveSystem && game) {
            console.log('[Save Integration] Periodic save...');
            saveSystem.save();
        }
    }, 120000); // Every 2 minutes
    
    // ============================================
    // SAVE ON PAGE VISIBILITY CHANGE
    // ============================================
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && saveSystem) {
            console.log('[Save Integration] Page hidden, saving...');
            saveSystem.save();
        }
    });
    
    // ============================================
    // MOBILE/TABLET SUPPORT
    // ============================================
    
    // Save on touch events for mobile
    let touchTimeout;
    document.addEventListener('touchend', function(e) {
        clearTimeout(touchTimeout);
        touchTimeout = setTimeout(() => {
            if (saveSystem && game) {
                saveSystem.save();
            }
        }, 5000); // Save 5 seconds after last touch
    });
    
    console.log('[Save Integration] ✅ Integration complete!');
    console.log('[Save Integration] Save system is ready to use.');
    console.log('[Save Integration] Commands: saveSystem.save(), saveSystem.load()');
});

// ============================================
// GLOBAL ERROR HANDLER (prevents save corruption)
// ============================================

window.addEventListener('error', function(e) {
    console.error('[Save Integration] Error detected:', e.error);
    
    // Try to save game state before crash
    if (saveSystem && game) {
        try {
            console.log('[Save Integration] Attempting emergency save...');
            saveSystem.save();
        } catch (saveError) {
            console.error('[Save Integration] Emergency save failed:', saveError);
        }
    }
});

// ============================================
// HELPER FUNCTION FOR DEBUGGING
// ============================================

window.debugSave = function() {
    console.log('=== SAVE SYSTEM DEBUG ===');
    console.log('Game object:', window.game);
    console.log('SaveSystem:', window.saveSystem);
    
    if (localStorage.getItem('CANAFarmSave')) {
        const save = JSON.parse(localStorage.getItem('CANAFarmSave'));
        console.log('Current save:', save);
        console.log('Save date:', save.saveDate);
        console.log('Game state:', save.gameState);
    } else {
        console.log('No save found in localStorage');
    }
    
    console.log('=========================');
};

console.log('[Save Integration] Script loaded! The save system will initialize when the page loads.');
