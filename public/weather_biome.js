// CANA Weather & Biome System
// Connects to real weather + detects player location

class WeatherBiomeSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.temperature = 72;
        this.humidity = 50;
        this.biome = 'temperate';
        this.playerLocation = null;
        this.forecast = [];
        
        // Biome affects everything
        this.biomeModifiers = {
            desert: { waterCost: 3, growthSpeed: 0.7, plants: ['cactus', 'aloe', 'agave'] },
            tropical: { waterCost: 1, growthSpeed: 1.5, plants: ['cacao', 'vanilla', 'coffee'] },
            temperate: { waterCost: 1, growthSpeed: 1.0, plants: ['tomato', 'carrot', 'wheat'] },
            arctic: { waterCost: 2, growthSpeed: 0.5, plants: ['kale', 'cabbage', 'potato'] },
            mountain: { waterCost: 1.5, growthSpeed: 0.8, plants: ['quinoa', 'potato', 'coca'] },
            rainforest: { waterCost: 0.5, growthSpeed: 2.0, plants: ['ayahuasca', 'cacao', 'rubber'] }
        };
        
        this.detectLocation();
    }
    
    async detectLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.playerLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.detectBiome();
                    this.fetchRealWeather();
                },
                (error) => {
                    console.log('Using default location');
                    this.playerLocation = { lat: 40.7128, lng: -74.0060 }; // NYC default
                    this.detectBiome();
                }
            );
        }
    }
    
    detectBiome() {
        // Simple biome detection based on latitude
        const lat = Math.abs(this.playerLocation.lat);
        
        if (lat < 23.5) this.biome = 'tropical';
        else if (lat < 35) this.biome = 'desert';
        else if (lat < 60) this.biome = 'temperate';
        else this.biome = 'arctic';
        
        // Notify game of biome
        if (window.updateBiome) {
            window.updateBiome(this.biome);
        }
    }
    
    async fetchRealWeather() {
        // For now, simulate weather
        // In production, connect to weather API
        this.generateWeather();
    }
    
    generateWeather() {
        const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
        const weights = [0.4, 0.25, 0.2, 0.1, 0.05];
        
        // Generate 7-day forecast
        this.forecast = [];
        for (let i = 0; i < 7; i++) {
            const random = Math.random();
            let cumWeight = 0;
            let weather = 'sunny';
            
            for (let j = 0; j < weatherTypes.length; j++) {
                cumWeight += weights[j];
                if (random < cumWeight) {
                    weather = weatherTypes[j];
                    break;
                }
            }
            
            this.forecast.push({
                day: i,
                weather: weather,
                temp: 60 + Math.random() * 30,
                rain: weather === 'rainy' || weather === 'stormy'
            });
        }
        
        this.currentWeather = this.forecast[0].weather;
        this.temperature = this.forecast[0].temp;
    }
    
    getTodaysWeather() {
        return {
            weather: this.currentWeather,
            temp: this.temperature,
            humidity: this.humidity,
            biome: this.biome,
            modifier: this.biomeModifiers[this.biome]
        };
    }
    
    // Weather effects on crops
    applyWeatherEffects(plot) {
        const weather = this.getTodaysWeather();
        
        // Rain waters all plants
        if (this.currentWeather === 'rainy') {
            plot.watered = true;
        }
        
        // Storm can damage plants
        if (this.currentWeather === 'stormy') {
            plot.health = Math.max(0, plot.health - 10);
        }
        
        // Temperature affects growth
        if (weather.temp < 40 || weather.temp > 95) {
            plot.growthRate *= 0.5; // Extreme temps slow growth
        }
        
        return plot;
    }
}

// Global weather system
const weatherBiome = new WeatherBiomeSystem();
