// Game updates for weather and PoG integration

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
