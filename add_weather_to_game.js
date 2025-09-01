// This file adds weather to the game
// Find the line "let game;" near the bottom
// Add this weather code right after it

class WeatherSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.rainChance = 0.3; // 30% chance of rain
    }
    
    checkWeather() {
        // Random weather each day
        const random = Math.random();
        if (random < this.rainChance) {
            this.currentWeather = 'rainy';
            return true; // It's raining!
        } else {
            this.currentWeather = 'sunny';
            return false;
        }
    }
}
