// CANA Social System - Guilds & Community

class GuildSystem {
    constructor() {
        this.myGuild = null;
        this.availableGuilds = [
            { id: 1, name: 'Permaculture Masters', members: 1247, bonus: 'companion_boost' },
            { id: 2, name: 'Seed Savers Alliance', members: 892, bonus: 'rare_seeds' },
            { id: 3, name: 'Medicinal Growers', members: 2341, bonus: 'medicine_value' },
            { id: 4, name: 'Carbon Farmers', members: 567, bonus: 'cana_multiplier' },
            { id: 5, name: 'Native Plants Society', members: 423, bonus: 'biome_mastery' }
        ];
        this.guildBenefits = {
            companion_boost: { desc: '+50% companion bonuses', multiplier: 1.5 },
            rare_seeds: { desc: 'Access to rare seeds', unlock: ['ginseng', 'saffron'] },
            medicine_value: { desc: '+30% medicinal plant value', multiplier: 1.3 },
            cana_multiplier: { desc: '2x CANA rewards', multiplier: 2 },
            biome_mastery: { desc: 'Grow any plant in any biome', universal: true }
        };
        this.guildChat = [];
        this.guildEvents = [];
    }
    
    // Join a guild
    joinGuild(guildId) {
        const guild = this.availableGuilds.find(g => g.id === guildId);
        if (guild) {
            this.myGuild = guild;
            guild.members++;
            
            // Apply guild benefits
            const benefit = this.guildBenefits[guild.bonus];
            this.applyGuildBonus(benefit);
            
            // Add to guild chat
            this.guildChat.push({
                user: 'System',
                message: 'Welcome to ' + guild.name + '!',
                timestamp: new Date()
            });
            
            localStorage.setItem('myGuild', JSON.stringify(guild));
            return guild;
        }
        return null;
    }
    
    // Apply guild bonuses
    applyGuildBonus(benefit) {
        if (window.gameState) {
            // Apply multipliers or unlocks based on benefit type
            console.log('Guild benefit applied:', benefit.desc);
        }
    }
    
    // Guild events (competitions, challenges)
    createGuildEvent() {
        const events = [
            { name: 'Biggest Pumpkin Contest', reward: 1000, duration: 7 },
            { name: 'Rare Seed Exchange', reward: 'rare_seeds', duration: 3 },
            { name: 'Speed Growing Challenge', reward: 500, duration: 1 },
            { name: 'Biodiversity Contest', reward: 2000, duration: 14 },
            { name: 'Community Garden', reward: 'multiplier', duration: 30 }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event.id = Date.now();
        event.participants = 0;
        event.startDate = new Date();
        
        this.guildEvents.push(event);
        return event;
    }
    
    // Guild chat
    sendGuildMessage(message) {
        const chatMessage = {
            user: window.gameState ? gameState.playerId : 'Player',
            message: message,
            timestamp: new Date()
        };
        
        this.guildChat.push(chatMessage);
        
        // Keep last 50 messages
        if (this.guildChat.length > 50) {
            this.guildChat = this.guildChat.slice(-50);
        }
        
        return chatMessage;
    }
    
    // Display guild UI
    displayGuildUI() {
        const guildUI = document.createElement('div');
        guildUI.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:20px;box-shadow:0 0 30px rgba(0,0,0,0.3);z-index:2000;max-width:600px;';
        
        if (this.myGuild) {
            guildUI.innerHTML = `
                <h2>🏰 ${this.myGuild.name}</h2>
                <p>Members: ${this.myGuild.members}</p>
                <p>Benefit: ${this.guildBenefits[this.myGuild.bonus].desc}</p>
                
                <h3>Active Events:</h3>
                <div id="guildEvents">
                    ${this.guildEvents.map(e => 
                        '<div>🏆 ' + e.name + ' - Reward: ' + e.reward + '</div>'
                    ).join('') || 'No active events'}
                </div>
                
                <h3>Guild Chat:</h3>
                <div style="height:200px;overflow-y:auto;background:#f5f5f5;padding:10px;border-radius:10px;">
                    ${this.guildChat.slice(-10).map(m => 
                        '<div><b>' + m.user + ':</b> ' + m.message + '</div>'
                    ).join('')}
                </div>
                <input type="text" id="guildChatInput" placeholder="Type message..." style="width:100%;margin-top:10px;padding:5px;">
                <button onclick="guildSystem.sendMessage()">Send</button>
            `;
        } else {
            guildUI.innerHTML = `
                <h2>🏰 Join a Guild</h2>
                ${this.availableGuilds.map(g => `
                    <div style="margin:10px;padding:10px;border:1px solid #ddd;border-radius:10px;">
                        <h3>${g.name}</h3>
                        <p>Members: ${g.members}</p>
                        <p>Benefit: ${this.guildBenefits[g.bonus].desc}</p>
                        <button onclick="guildSystem.joinGuild(${g.id})">Join Guild</button>
                    </div>
                `).join('')}
            `;
        }
        
        guildUI.innerHTML += '<button onclick="this.parentElement.remove()" style="margin-top:20px;">Close</button>';
        document.body.appendChild(guildUI);
    }
    
    // Send message helper
    sendMessage() {
        const input = document.getElementById('guildChatInput');
        if (input && input.value) {
            this.sendGuildMessage(input.value);
            input.value = '';
            this.displayGuildUI(); // Refresh display
        }
    }
}

const guildSystem = new GuildSystem();

// Competition system
class CompetitionSystem {
    constructor() {
        this.activeCompetitions = [];
        this.leaderboard = [];
    }
    
    // Create competition
    createCompetition(type) {
        const competitions = {
            daily: { name: 'Daily Harvest', duration: 1, reward: 100 },
            weekly: { name: 'Weekly Growth', duration: 7, reward: 500 },
            seasonal: { name: 'Season Champion', duration: 30, reward: 2000 }
        };
        
        const comp = competitions[type];
        comp.id = Date.now();
        comp.participants = [];
        comp.startTime = new Date();
        
        this.activeCompetitions.push(comp);
        return comp;
    }
    
    // Join competition
    joinCompetition(compId) {
        const comp = this.activeCompetitions.find(c => c.id === compId);
        if (comp && window.gameState) {
            comp.participants.push({
                player: gameState.playerId,
                score: 0,
                joinTime: new Date()
            });
            return true;
        }
        return false;
    }
    
    // Update competition score
    updateScore(compId, points) {
        const comp = this.activeCompetitions.find(c => c.id === compId);
        if (comp && window.gameState) {
            const participant = comp.participants.find(p => p.player === gameState.playerId);
            if (participant) {
                participant.score += points;
                this.updateLeaderboard(comp);
            }
        }
    }
    
    // Update leaderboard
    updateLeaderboard(competition) {
        competition.participants.sort((a, b) => b.score - a.score);
        this.leaderboard = competition.participants.slice(0, 10);
    }
}

const competitionSystem = new CompetitionSystem();
