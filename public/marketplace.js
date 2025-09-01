// CANA Marketplace - P2P Trading System
// Like FarmTown but with blockchain verification

class Marketplace {
    constructor() {
        this.listings = [];
        this.trades = [];
        this.users = new Map();
    }
    
    // Create a listing
    createListing(seller, item, quantity, price) {
        const listing = {
            id: Date.now(),
            seller: seller,
            item: item,
            quantity: quantity,
            price: price,
            timestamp: new Date(),
            status: 'active'
        };
        this.listings.push(listing);
        return listing;
    }
    
    // Execute trade
    executeTrade(buyer, listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing || listing.status !== 'active') return false;
        
        const trade = {
            id: Date.now(),
            buyer: buyer,
            seller: listing.seller,
            item: listing.item,
            quantity: listing.quantity,
            price: listing.price,
            timestamp: new Date(),
            txHash: null // Will be blockchain hash
        };
        
        this.trades.push(trade);
        listing.status = 'sold';
        return trade;
    }
    
    // Get active listings
    getActiveListings() {
        return this.listings.filter(l => l.status === 'active');
    }
}

// Global marketplace instance
const marketplace = new Marketplace();
