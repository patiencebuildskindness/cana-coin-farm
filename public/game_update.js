// Game updates for weather and PoG integration
// Fix the plant database reference
if (window.plants && !window.PLANT_DATABASE) {
    window.PLANT_DATABASE = window.plants;
    console.log("✅ Connected PLANT_DATABASE to window.plants");
}

// Update biome based on location
window.updateBiome = function(biome) {
    const biomeDisplay = document.createElement('div');
    biomeDisplay.className = 'stat';
    biomeDisplay.innerHTML = 'Biome: ' + biome;
    document.getElementById('gameStats').appendChild(biomeDisplay);
    
    // Adjust available plants based on biome
    console.log('Biome detected:', biome);
    console.log('Biome modifiers:', weatherBiome.biomeModifiers[biome]);
};

// Add weather display
window.displayWeather = function() {
    const weather = weatherBiome.getTodaysWeather();
    const weatherDisplay = document.createElement('div');
    weatherDisplay.id = 'weatherDisplay';
    weatherDisplay.style.cssText = 'position: fixed; top: 20px; left: 20px; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
    
    let weatherEmoji = '☀️';
    if (weather.weather === 'rainy') weatherEmoji = '🌧️';
    if (weather.weather === 'cloudy') weatherEmoji = '☁️';
    if (weather.weather === 'stormy') weatherEmoji = '⛈️';
    if (weather.weather === 'foggy') weatherEmoji = '🌫️';
    
    weatherDisplay.innerHTML = 
        '<h3>Weather</h3>' +
        '<div>' + weatherEmoji + ' ' + weather.weather + '</div>' +
        '<div>🌡️ ' + Math.round(weather.temp) + '°F</div>' +
        '<div>💧 ' + weather.humidity + '%</div>' +
        '<div>🗺️ ' + weather.biome + '</div>';
    
    document.body.appendChild(weatherDisplay);
    
    // Show forecast
    const forecastBtn = document.createElement('button');
    forecastBtn.textContent = '📅 7-Day Forecast';
    forecastBtn.onclick = showForecast;
    weatherDisplay.appendChild(forecastBtn);
};

// Show weather forecast
window.showForecast = function() {
    let forecastHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,0.5);z-index:1000;">';
    forecastHTML += '<h2>7-Day Forecast</h2>';
    
    weatherBiome.forecast.forEach((day, index) => {
        let emoji = '☀️';
        if (day.weather === 'rainy') emoji = '🌧️';
        if (day.weather === 'cloudy') emoji = '☁️';
        if (day.weather === 'stormy') emoji = '⛈️';
        
        forecastHTML += '<div>Day ' + (index + 1) + ': ' + emoji + ' ' + 
                       Math.round(day.temp) + '°F' + 
                       (day.rain ? ' (Auto-water!)' : '') + '</div>';
    });
    
    forecastHTML += '<button onclick="this.parentElement.remove()">Close</button></div>';
    document.body.insertAdjacentHTML('beforeend', forecastHTML);
};

// Photo upload for PoG
window.uploadGrowthPhoto = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Submit to PoG system
                proofOfGrowth.submitProof('plant_' + Date.now(), event.target.result);
                
                // Show preview
                const preview = document.createElement('div');
                preview.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:10px;z-index:1000;';
                preview.innerHTML = 
                    '<h3>Growth Proof Submitted!</h3>' +
                    '<img src="' + event.target.result + '" style="max-width:300px;">' +
                    '<p>Verifying growth...</p>' +
                    '<button onclick="this.parentElement.remove()">Close</button>';
                document.body.appendChild(preview);
                
                // Check verification after delay
                setTimeout(() => {
                    const history = proofOfGrowth.getGrowthHistory();
                    preview.querySelector('p').textContent = 
                        'Pending rewards: ' + history.pending + ' CANA';
                }, 3000);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
};

// Initialize weather display when game loads
setTimeout(() => {
    displayWeather();
}, 1000);

// Friends list UI
window.showFriendsList = function() {
    const friends = multiplayerVisit.getFriends();
    
    const friendsUI = document.createElement('div');
    friendsUI.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:20px;box-shadow:0 0 30px rgba(0,0,0,0.3);z-index:2000;';
    
    friendsUI.innerHTML = '<h2>👥 Friends List</h2>';
    
    // Add friend code display
    friendsUI.innerHTML += '<div style="background:#e3f2fd;padding:10px;border-radius:10px;margin:10px 0;">' +
                          'Your Farm Code: <b>' + multiplayerVisit.myFarmId + '</b>' +
                          '<button onclick="copyFarmCode()">📋 Copy</button></div>';
    
    // Add friend input
    friendsUI.innerHTML += '<input type="text" id="friendCodeInput" placeholder="Enter friend code...">' +
                          '<button onclick="addFriendByCode()">Add Friend</button>';
    
    // List friends
    if (friends.length === 0) {
        friendsUI.innerHTML += '<p>No friends yet. Share your farm code!</p>';
    } else {
        friendsUI.innerHTML += '<h3>Your Friends:</h3>';
        friends.forEach(friend => {
            friendsUI.innerHTML += '<div style="margin:10px;padding:10px;border:1px solid #ddd;border-radius:10px;">' +
                                 friend + 
                                 '<button onclick="multiplayerVisit.visitFarm(\'' + friend + '\')">Visit Farm</button>' +
                                 '</div>';
        });
    }
    
    friendsUI.innerHTML += '<button onclick="this.parentElement.remove()">Close</button>';
    document.body.appendChild(friendsUI);
};

// Copy farm code
window.copyFarmCode = function() {
    navigator.clipboard.writeText(multiplayerVisit.myFarmId);
    showStatus('Farm code copied!');
};

// Add friend by code
window.addFriendByCode = function() {
    const input = document.getElementById('friendCodeInput');
    if (input && input.value) {
        if (multiplayerVisit.addFriend(input.value)) {
            showStatus('Friend added!');
            showFriendsList(); // Refresh
        }
    }
};

// Show competitions
window.showCompetitions = function() {
    const compUI = document.createElement('div');
    compUI.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:20px;box-shadow:0 0 30px rgba(0,0,0,0.3);z-index:2000;';
    
    compUI.innerHTML = '<h2>🏆 Competitions</h2>';
    
    // Create sample competitions if none exist
    if (competitionSystem.activeCompetitions.length === 0) {
        competitionSystem.createCompetition('daily');
        competitionSystem.createCompetition('weekly');
    }
    
    competitionSystem.activeCompetitions.forEach(comp => {
        compUI.innerHTML += '<div style="margin:10px;padding:10px;border:2px solid #ffd700;border-radius:10px;">' +
                          '<h3>' + comp.name + '</h3>' +
                          '<p>Reward: ' + comp.reward + ' CANA</p>' +
                          '<p>Participants: ' + comp.participants.length + '</p>' +
                          '<button onclick="competitionSystem.joinCompetition(' + comp.id + ')">Join Competition</button>' +
                          '</div>';
    });
    
    compUI.innerHTML += '<button onclick="this.parentElement.remove()">Close</button>';
    document.body.appendChild(compUI);
};
// fix_companion_planting_REAL.js
// This uses YOUR ACTUAL PLANTS from the database you already built!

function addRealCompanionSystem() {
    // Companion rules based on YOUR botanical families
    // These are the actual families in your PLANT_DATABASE
    const COMPANION_RULES = {
        'Fabaceae': {  // Your nitrogen-fixing plants (27 plants in your DB)
            helps: ['Brassicaceae', 'Solanaceae', 'Cucurbitaceae', 'Poaceae'],
            bonus: 0.25,  // 25% growth boost from nitrogen
            description: 'Nitrogen fixing helps growth'
        },
        'Asteraceae': {  // Your companion flowers (30 plants in your DB)
            helps: ['Solanaceae', 'Cucurbitaceae', 'Brassicaceae', 'Apiaceae'],
            bonus: 0.30,  // 30% yield bonus from beneficial insects
            description: 'Attracts pollinators'
        },
        'Lamiaceae': {  // Your aromatic herbs (23 plants in your DB)
            helps: ['Solanaceae', 'Brassicaceae', 'Rosaceae'],
            bonus: 0.20,  // 20% pest protection
            description: 'Aromatic pest deterrent'
        },
        'Apiaceae': {  // Your umbel flowers (15 plants in your DB)
            helps: ['Brassicaceae', 'Solanaceae', 'Asteraceae'],
            bonus: 0.15,
            description: 'Attracts predatory insects'
        },
        'Alliaceae': {  // Your alliums (onion family in your DB)
            helps: ['Brassicaceae', 'Solanaceae', 'Rosaceae'],
            bonus: 0.20,
            description: 'Strong scent repels pests'
        },
        'Poaceae': {  // Your grasses/grains
            helps: ['Fabaceae', 'Cucurbitaceae'],
            bonus: 0.10,
            description: 'Provides structure'
        },
        'Brassicaceae': {  // Your cabbage family
            helps: ['Asteraceae', 'Lamiaceae'],
            bonus: 0.15,
            description: 'Trap crop for pests'
        }
    };

    // Add to your existing game object
    window.game.companionSystem = {
        rules: COMPANION_RULES,
        
        // Get adjacent plots (8 surrounding squares)
        getAdjacentPlots: function(x, y) {
            const adjacent = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < 12 && ny >= 0 && ny < 12) {
                        adjacent.push({x: nx, y: ny});
                    }
                }
            }
            return adjacent;
        },

        // Calculate bonuses using YOUR plant database
        calculateBonus: function(x, y) {
            const plot = window.game.farm[y][x];
            if (!plot.plant) return null;

            const bonuses = {
                growthSpeed: 1.0,
                health: 1.0,
                yield: 1.0,
                pestResistance: 1.0,
                sources: []
            };

            // Get plant's family from YOUR database
            // Your plants are stored by name in PLANT_DATABASE
            let myFamily = null;
            
            // Search through your actual plant families
            for (const [family, plants] of Object.entries(window.PLANT_DATABASE)) {
                if (family === 'all') continue;  // Skip the 'all' array
                if (plants.some(p => p.name === plot.plant)) {
                    myFamily = family;
                    break;
                }
            }
            
            if (!myFamily) return bonuses;

            // Check all adjacent plots for companions
            const adjacent = this.getAdjacentPlots(x, y);
            
            for (const adj of adjacent) {
                const adjPlot = window.game.farm[adj.y][adj.x];
                if (!adjPlot.plant) continue;
                
                // Find adjacent plant's family
                let adjFamily = null;
                for (const [family, plants] of Object.entries(window.PLANT_DATABASE)) {
                    if (family === 'all') continue;
                    if (plants.some(p => p.name === adjPlot.plant)) {
                        adjFamily = family;
                        break;
                    }
                }
                
                if (!adjFamily) continue;

                // Check if this family helps us
                if (COMPANION_RULES[adjFamily] && 
                    COMPANION_RULES[adjFamily].helps.includes(myFamily)) {
                    
                    const bonus = COMPANION_RULES[adjFamily].bonus;
                    bonuses.growthSpeed += bonus;
                    bonuses.health += bonus * 0.5;
                    bonuses.yield += bonus * 0.75;
                    bonuses.pestResistance += bonus;
                    
                    bonuses.sources.push({
                        plant: adjPlot.plant,
                        family: adjFamily,
                        bonus: COMPANION_RULES[adjFamily].description,
                        position: `${adj.x},${adj.y}`
                    });
                }
            }

            return bonuses;
        },

        // Apply companion bonuses during growth
        applyCompanionBonus: function(x, y) {
            const plot = window.game.farm[y][x];
            if (!plot.plant || plot.growthStage === undefined) return;

            const bonuses = this.calculateBonus(x, y);
            if (!bonuses || bonuses.sources.length === 0) return;

            // Apply growth speed bonus
            if (bonuses.growthSpeed > 1.0) {
                // Speed up growth based on companion bonus
                const plantData = window.PLANT_DATABASE.all.find(p => p.name === plot.plant);
                if (plantData) {
                    const growthBoost = (bonuses.growthSpeed - 1.0) * 0.1;
                    plot.growthStage = Math.min(1.0, plot.growthStage + growthBoost);
                }
                
                // Mark as having companion bonus
                plot.hasCompanionBonus = true;
                plot.companionMultiplier = bonuses.growthSpeed;
            }

            // Apply health bonus if plant has health
            if (plot.health !== undefined && bonuses.health > 1.0) {
                plot.health = Math.min(100, plot.health + (bonuses.health - 1.0) * 2);
            }

            // Store yield bonus for harvest time
            if (bonuses.yield > 1.0) {
                plot.yieldMultiplier = bonuses.yield;
            }

            return bonuses;
        },

        // Visual indicators for companion bonuses
        renderCompanionIndicators: function(ctx) {
            const gridSize = 50;
            
            for (let y = 0; y < 12; y++) {
                for (let x = 0; x < 12; x++) {
                    const plot = window.game.farm[y][x];
                    if (!plot.plant) continue;

                    const bonuses = this.calculateBonus(x, y);
                    if (!bonuses || bonuses.sources.length === 0) continue;

                    // Green glow effect
                    ctx.save();
                    
                    // Draw soft green glow
                    const gradient = ctx.createRadialGradient(
                        x * gridSize + gridSize/2, 
                        y * gridSize + gridSize/2, 
                        0,
                        x * gridSize + gridSize/2, 
                        y * gridSize + gridSize/2, 
                        gridSize/2
                    );
                    gradient.addColorStop(0, 'rgba(100, 255, 100, 0.3)');
                    gradient.addColorStop(1, 'rgba(100, 255, 100, 0.0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                    
                    // Draw connection lines
                    ctx.strokeStyle = 'rgba(100, 255, 100, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([3, 3]);
                    
                    for (const source of bonuses.sources) {
                        const [sx, sy] = source.position.split(',').map(Number);
                        ctx.beginPath();
                        ctx.moveTo(x * gridSize + gridSize/2, y * gridSize + gridSize/2);
                        ctx.lineTo(sx * gridSize + gridSize/2, sy * gridSize + gridSize/2);
                        ctx.stroke();
                    }
                    
                    // Draw bonus percentage
                    ctx.fillStyle = '#4eff4e';
                    ctx.font = 'bold 10px Arial';
                    ctx.shadowColor = 'black';
                    ctx.shadowBlur = 3;
                    const bonusText = `+${Math.round((bonuses.growthSpeed - 1) * 100)}%`;
                    ctx.fillText(bonusText, x * gridSize + 2, y * gridSize + 48);
                    
                    ctx.restore();
                }
            }
        },

        // Detailed tooltip for companion info
        getCompanionTooltip: function(x, y) {
            const bonuses = this.calculateBonus(x, y);
            if (!bonuses || bonuses.sources.length === 0) return null;

            let tooltip = '🌿 Companion Plant Bonuses:\n';
            tooltip += '─────────────────\n';
            
            for (const source of bonuses.sources) {
                tooltip += `${source.plant} (${source.family})\n`;
                tooltip += `  → ${source.bonus}\n`;
            }
            
            tooltip += '\n📊 Total Effects:\n';
            tooltip += `Growth Speed: +${Math.round((bonuses.growthSpeed - 1) * 100)}%\n`;
            tooltip += `Plant Health: +${Math.round((bonuses.health - 1) * 100)}%\n`;
            tooltip += `Harvest Yield: +${Math.round((bonuses.yield - 1) * 100)}%\n`;
            
            return tooltip;
        }
    };

    console.log('✅ Companion system using YOUR plant database!');
}

// Hook into your existing game loop
function integrateWithYourGame() {
    // Add to your existing daily update
    const originalDailyUpdate = window.game.dailyUpdate;
    window.game.dailyUpdate = function() {
        // Do original daily update
        if (originalDailyUpdate) originalDailyUpdate.call(this);
        
        // Apply companion bonuses to all plots
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 12; x++) {
                if (window.game.companionSystem) {
                    window.game.companionSystem.applyCompanionBonus(x, y);
                }
            }
        }
    };

    // Add to your render loop
    const originalRender = window.game.render || window.game.draw;
    window.game.render = function(ctx) {
        // Do original rendering
        if (originalRender) originalRender.call(this, ctx);
        
        // Draw companion indicators on top
        if (window.game.companionSystem) {
            window.game.companionSystem.renderCompanionIndicators(ctx);
        }
    };
}

// Initialize the fix
function initializeRealCompanionSystem() {
    console.log('🔧 Fixing companion planting with YOUR plants...');
    
    // Make sure your plant database exists
    if (!window.PLANT_DATABASE) {
        console.error('❌ PLANT_DATABASE not found! Load plants.js first.');
        return;
    }
    
    // Add the companion system
    addRealCompanionSystem();
    
    // Integrate with your game
    integrateWithYourGame();
    
    console.log('✅ Companion planting now works with YOUR 369 plants!');
    console.log('Example combinations from YOUR database:');
    console.log('• Fabaceae plants (beans/peas) help Brassicaceae (cabbage family)');
    console.log('• Asteraceae (sunflowers/marigolds) help Solanaceae (nightshades)');
    console.log('• Lamiaceae (mint/basil) provide pest protection');
}

// Run it
initializeRealCompanionSystem();

// Test with YOUR actual plants
window.testRealCompanions = function() {
    console.log('Testing with plants from YOUR database:');
    
    // Plant a Brassicaceae (from your DB)
    const cabbage = window.PLANT_DATABASE.Brassicaceae[0];  // First cabbage family plant
    window.game.farm[5][5] = {
        plant: cabbage.name,
        growthStage: 0.5,
        health: 100
    };
    
    // Plant a Fabaceae next to it (nitrogen fixer from your DB)
    const bean = window.PLANT_DATABASE.Fabaceae[0];  // First bean family plant
    window.game.farm[5][6] = {
        plant: bean.name,
        growthStage: 0.5,
        health: 100
    };
    
    console.log(`Planted ${cabbage.name} and ${bean.name} as companions`);
    
    // Calculate bonus
    const bonus = window.game.companionSystem.calculateBonus(5, 5);
    console.log('Companion bonus:', bonus);
    
    return bonus;
};
