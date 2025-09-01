// Fix for button functionality
window.addEventListener('load', function() {
    console.log('Fixing game buttons...');
    
    // Make sure game exists
    if (typeof game === 'undefined') {
        console.log('Reinitializing game...');
        setTimeout(function() {
            if (typeof FarmGame !== 'undefined') {
                window.game = new FarmGame();
                window.game.updateUI();
                console.log('Game reinitialized!');
            }
        }, 1000);
    }
    
    // Reattach button handlers
    setTimeout(function() {
        // Fix all button onclick handlers
        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(btn) {
            if (btn.textContent.includes('Water')) {
                btn.onclick = function() { if(game) game.waterPlot(); };
            }
            if (btn.textContent.includes('Harvest')) {
                btn.onclick = function() { if(game) game.harvestPlot(); };
            }
            if (btn.textContent.includes('Till')) {
                btn.onclick = function() { if(game) game.tillSoil(); };
            }
            if (btn.textContent.includes('Market')) {
                btn.onclick = function() { if(game) game.openMarket(); };
            }
            if (btn.textContent.includes('Sleep')) {
                btn.onclick = function() { if(game) game.advanceDay(); };
            }
        });
        console.log('Buttons fixed!');
    }, 2000);
});
