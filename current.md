# CANA Coin Farm - Complete Vision & Implementation Architecture

## Vision Statement
A revolutionary Web3 educational game combining farming simulation, real-world plant identification, regenerative agriculture education, and blockchain-verified environmental impact through Proof of Growth (PoG).

## Core Architecture Redesign

### Phase 0: Foundation Restructure (Weeks 1-2)

#### Character & Land System
```javascript
// Player starts with:
const playerInitialState = {
    character: {
        avatar: 'farmer_basic',
        x: 0,
        y: 0,
        inventory: [],
        tools: ['basic_hoe', 'watering_can'],
        movement: 'walk'
    },
    land: {
        plots: 1,  // Start with single plot
        size: '10x10',
        biome: 'temperate',
        soil_quality: 0.5,
        elevation: 0,
        coordinates: null  // Optional GPS
    },
    startingSeeds: []  // 10 random from 369 pool
};
-- Core tables for expandable system
CREATE TABLE characters (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    avatar_type TEXT,
    position_x INTEGER,
    position_y INTEGER,
    movement_type TEXT DEFAULT 'walk'
);

CREATE TABLE land_parcels (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    parcel_number INTEGER,
    size_x INTEGER DEFAULT 10,
    size_y INTEGER DEFAULT 10,
    biome TEXT,
    soil_quality REAL,
    elevation INTEGER,
    latitude REAL,
    longitude REAL,
    weather_zone TEXT
);

CREATE TABLE plant_species (
    id INTEGER PRIMARY KEY,
    common_name TEXT,
    scientific_name TEXT,
    family TEXT,
    growth_stages TEXT, -- JSON array of stages
    optimal_harvest_window INTEGER,
    seed_cost INTEGER,
    market_base_price INTEGER,
    companion_plants TEXT, -- JSON array
    soil_requirements TEXT,
    climate_zones TEXT,
    season_planting TEXT,
    season_harvest TEXT,
    drying_time INTEGER,
    storage_type TEXT
);
class Character {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.speed = 1;
        this.sprite = 'farmer_basic';
    }
    
    move(direction) {
        // Grid-based movement
        // Collision detection with plots/buildings
        // Energy consumption based on movement type
    }
    
    upgrade_movement(type) {
        // walk -> bicycle -> cart -> wagon
        this.speed = MOVEMENT_SPEEDS[type];
    }
}
class Farm {
    constructor() {
        this.parcels = [new Parcel(10, 10)];
        this.buildings = [];
        this.totalArea = 100;
    }
    
    expandLand(direction) {
        // Cost increases exponentially
        // Must maintain connected parcels
        // Terrain generation based on biome
    }
    
    addBuilding(type, x, y) {
        // shed, greenhouse_small, greenhouse_medium, etc.
        // Each building has environmental impact score
    }
}

function initializePlayerSeeds() {
    const availableSeeds = [];
    const categories = {
        vegetables: 3,
        herbs: 3,
        flowers: 2,
        trees: 1,
        grains: 1
    };
    
    // Select 10 random seeds balanced across categories
    for (let [category, count] of Object.entries(categories)) {
        const categoryPlants = ALL_PLANTS.filter(p => p.category === category);
        const selected = selectRandom(categoryPlants, count);
        availableSeeds.push(...selected);
    }
    
    return availableSeeds;
}
class Marketplace {
    constructor() {
        this.prices = {};
        this.supply = {};
        this.demand = {};
    }
    
    calculatePrice(plantId) {
        const basePr = PLANTS[plantId].base_price;
        const supply = this.getGlobalSupply(plantId);
        const demand = this.getGlobalDemand(plantId);
        
        // Price inversely proportional to supply
        // Bonus for rare/underplanted species
        const scarcityMultiplier = Math.max(0.5, 2 - (supply / demand));
        const seasonalMultiplier = this.getSeasonalMultiplier(plantId);
        const qualityMultiplier = this.getQualityMultiplier(plantId);
        
        return basePr * scarcityMultiplier * seasonalMultiplier * qualityMultiplier;
    }
    
    getTransportCost(distance, method) {
        const costs = {
            walk: distance * 0.1,
            bicycle: distance * 0.05,
            cart: distance * 0.03,
            wagon: distance * 0.02
        };
        return costs[method];
    }
}
const STORAGE_TYPES = {
    burlap_sack: { capacity: 50, preservation: 0.7, cost: 10 },
    wooden_crate: { capacity: 100, preservation: 0.8, cost: 25 },
    glass_jar: { capacity: 10, preservation: 0.95, cost: 15 },
    drying_rack: { capacity: 30, preservation: 0.9, process: 'dry', cost: 50 }
};

class Inventory {
    processPlant(plant, method) {
        switch(method) {
            case 'dry':
                return {...plant, state: 'dried', value: plant.value * 1.5};
            case 'tincture':
                return {...plant, state: 'tincture', value: plant.value * 3};
            case 'powder':
                return {...plant, state: 'powder', value: plant.value * 2};
        }
    }
}
const COMPANION_MATRIX = {
    tomato: {
        beneficial: ['basil', 'marigold', 'carrots'],
        harmful: ['brassicas', 'fennel']
    },
    // ... for all plants
};

function calculateSynergyBonus(plot) {
    let bonus = 1.0;
    const neighbors = getAdjacentPlots(plot);
    
    neighbors.forEach(neighbor => {
        if (COMPANION_MATRIX[plot.plant].beneficial.includes(neighbor.plant)) {
            bonus += 0.15;  // 15% growth speed boost
        }
        if (COMPANION_MATRIX[plot.plant].harmful.includes(neighbor.plant)) {
            bonus -= 0.10;  // 10% growth penalty
        }
    });
    
    return bonus;
}
class SoilSystem {
    constructor() {
        this.nutrients = {
            nitrogen: 50,
            phosphorus: 50,
            potassium: 50,
            organic_matter: 30
        };
        this.pH = 6.5;
        this.moisture = 50;
    }
    
    plantImpact(plant) {
        // Different plants deplete/add different nutrients
        // Legumes add nitrogen
        // Heavy feeders deplete more
    }
    
    improveWithCompost() {
        this.organic_matter += 10;
        this.balanceNutrients();
    }
    
    coverCrop(type) {
        // Winter cover crops improve soil
        // Prevent erosion
    }
}
class BiodiversityTracker {
    calculate(farm) {
        let score = 0;
        
        // Species diversity
        const uniqueSpecies = new Set(farm.plants.map(p => p.species));
        score += uniqueSpecies.size * 10;
        
        // Pollinator habitats
        score += farm.pollinatorPlants.length * 5;
        
        // Natural windbreaks
        score += farm.trees.filter(t => t.type === 'windbreak').length * 15;
        
        // Wildlife habitats
        score += farm.wildlifeAreas * 20;
        
        // Monoculture penalty
        const monocultureRatio = this.calculateMonocultureRatio(farm);
        score *= (1 - monocultureRatio * 0.5);
        
        return score;
    }
}
class LocationService {
    async getUserLocation() {
        // Get GPS coordinates
        const position = await navigator.geolocation.getCurrentPosition();
        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
    }
    
    async getLocalClimate(lat, lon) {
        // API call to weather service
        // Determine growing zone
        // Get seasonal data
        return {
            zone: 'USDA_6b',
            season: 'spring',
            frost_dates: { last: 'May 15', first: 'Oct 15' }
        };
    }
    
    recommendPlants(climate) {
        // Filter 7000+ plants by local growing conditions
        return PLANTS.filter(p => p.zones.includes(climate.zone));
    }
}
class PlantScanner {
    async identifyPlant(imageData) {
        // Integration with plant identification API
        // PlantNet, iNaturalist, or custom model
        
        const identification = await API.identify(imageData);
        
        if (identification.confidence > 0.8) {
            return {
                species: identification.species,
                common_name: identification.common,
                edible: identification.edible,
                medicinal: identification.medicinal,
                toxic: identification.toxic
            };
        }
    }
    
    addToGame(plantData) {
        if (plantData.toxic) {
            return { error: 'Cannot add toxic plants' };
        }
        
        // Add to user's discovered plants
        // Grant discovery bonus
        // Add to global plant database if new
    }
    
    verifyGrowth(plantId, images) {
        // Proof of Growth verification
        // Compare images over time
        // Verify plant health
        // Award PoG tokens
    }
}
class ProofOfGrowth {
    constructor() {
        this.verificationThreshold = 3;  // Need 3 proofs
        this.timeRequirement = 30 * 24 * 60 * 60 * 1000;  // 30 days
    }
    
    async submitProof(userId, plantId, evidence) {
        const proof = {
            timestamp: Date.now(),
            plantId: plantId,
            images: evidence.images,
            measurements: evidence.measurements,
            location: evidence.gps,
            environmental_data: {
                temperature: evidence.temp,
                humidity: evidence.humidity,
                soil_moisture: evidence.moisture
            }
        };
        
        const isValid = await this.verifyProof(proof);
        
        if (isValid) {
            this.awardTokens(userId, this.calculateReward(proof));
        }
    }
    
    calculateReward(proof) {
        let base = 10;  // Base CANA tokens
        
        // Bonus for native species
        if (proof.plant.native) base *= 1.5;
        
        // Bonus for endangered species
        if (proof.plant.conservation_status === 'endangered') base *= 2;
        
        // Bonus for organic methods
        if (proof.organic_certified) base *= 1.3;
        
        return base;
    }
}class CommunityMarket {
    hostMarket(farmId) {
        // Players can host markets
        // Visitors get transport bonuses
        // Social interaction rewards
        // Knowledge sharing bonuses
    }
    
    seedExchange(player1, player2) {
        // Trade rare seeds
        // Preserve heirloom varieties
        // Build seed library
    }
    
    mentorship(expert, novice) {
        // Experienced players teach newcomers
        // Both get rewards
        // Build knowledge network
    }
}const QUEST_TYPES = {
    companion_planting: {
        objective: 'Plant three compatible species together',
        reward: { xp: 100, seeds: 'rare_heirloom' },
        teaches: 'synergistic relationships'
    },
    soil_health: {
        objective: 'Improve soil organic matter by 20%',
        reward: { xp: 150, tool: 'composting_bin' },
        teaches: 'regenerative practices'
    },
    biodiversity: {
        objective: 'Grow 20 different species simultaneously',
        reward: { xp: 200, title: 'Biodiversity Guardian' },
        teaches: 'ecosystem management'
    },
    seasonal: {
        objective: 'Successfully grow season-appropriate crops',
        reward: { xp: 100, multiplier: 1.2 },
        teaches: 'seasonal awareness'
    }
};
-- Partitioned tables for 7000+ plants
CREATE TABLE plants_master (
    id INTEGER PRIMARY KEY,
    -- Basic fields
) PARTITION BY RANGE (id);

CREATE TABLE plants_1_1000 PARTITION OF plants_master
    FOR VALUES FROM (1) TO (1000);
-- Continue for all ranges

-- Indexed for fast searches
CREATE INDEX idx_plants_zone ON plants_master(climate_zones);
CREATE INDEX idx_plants_companions ON plants_master(companion_plants);
CREATE INDEX idx_plants_season ON plants_master(season_planting);
// Plugin architecture for easy feature addition
class GameCore {
    constructor() {
        this.modules = new Map();
    }
    
    registerModule(name, module) {
        this.modules.set(name, module);
        module.initialize(this);
    }
}

// Each feature as independent module
class MarketplaceModule {
    initialize(core) {
        this.core = core;
        this.setupEndpoints();
        this.setupUI();
    }
}
// Lazy loading for massive plant database
class PlantDatabase {
    constructor() {
        this.cache = new Map();
        this.loaded = new Set();
    }
    
    async getPlant(id) {
        if (!this.cache.has(id)) {
            const plant = await this.loadPlant(id);
            this.cache.set(id, plant);
        }
        return this.cache.get(id);
    }
    
    async searchPlants(query) {
        // Use indexed search
        // Return paginated results
        // Load details on demand
    }
}
