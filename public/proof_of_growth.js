// Proof of Growth (PoG) System
// Photo verification for real plant growth = CANA rewards

class ProofOfGrowth {
    constructor() {
        this.submissions = [];
        this.verifiedGrowth = [];
        this.pendingRewards = 0;
        this.totalCANAEarned = 0;
    }
    
    // Submit growth proof
    async submitProof(plantId, photo) {
        const submission = {
            id: Date.now(),
            plantId: plantId,
            photo: photo,
            timestamp: new Date(),
            status: 'pending',
            growthDetected: 0,
            reward: 0
        };
        
        this.submissions.push(submission);
        
        // Simulate AI verification (in production, use TensorFlow)
        setTimeout(() => {
            this.verifyGrowth(submission);
        }, 2000);
        
        return submission;
    }
    
    // Verify plant growth
    verifyGrowth(submission) {
        // Simulate computer vision analysis
        const growthScore = Math.random() * 100;
        
        if (growthScore > 30) {
            submission.status = 'verified';
            submission.growthDetected = growthScore;
            
            // Calculate CANA reward
            submission.reward = Math.floor(growthScore * 0.1);
            this.pendingRewards += submission.reward;
            
            this.verifiedGrowth.push(submission);
            
            // Update UI
            if (window.showStatus) {
                window.showStatus('Growth verified! Earned ' + submission.reward + ' CANA');
            }
        } else {
            submission.status = 'rejected';
        }
        
        return submission;
    }
    
    // Claim rewards
    claimRewards() {
        const rewards = this.pendingRewards;
        this.totalCANAEarned += rewards;
        this.pendingRewards = 0;
        
        // Add to game state
        if (window.gameState) {
            window.gameState.economy.canaTokens += rewards;
        }
        
        return rewards;
    }
    
    // Get growth history
    getGrowthHistory() {
        return {
            total: this.submissions.length,
            verified: this.verifiedGrowth.length,
            pending: this.pendingRewards,
            earned: this.totalCANAEarned
        };
    }
}

const proofOfGrowth = new ProofOfGrowth();
