// CANA Plant Database - Scalable to 7000+ plants
// Organized by family for companion relationships

const PLANT_DATABASE = {
    // Database metadata
    version: "2.0",
    totalPlants: 369,
    lastUpdated: new Date().toISOString(),
    
    // Plants organized by family for companion logic
    families: {
        // ASTERACEAE FAMILY (30 plants) - Good companions, attract beneficials
        Asteraceae: {
            arnica: { id: 1, name: 'Arnica', emoji: '🌼', growthTime: 5, basePrice: 35, seedCost: 12, waterNeeded: 2 },
            artichoke: { id: 2, name: 'Artichoke', emoji: '🌿', growthTime: 8, basePrice: 30, seedCost: 12, waterNeeded: 2 },
            boneset: { id: 3, name: 'Boneset', emoji: '🌿', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 3 },
            burdock: { id: 4, name: 'Burdock', emoji: '🌿', growthTime: 6, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            calendula: { id: 5, name: 'Calendula', emoji: '🌻', growthTime: 4, basePrice: 20, seedCost: 7, waterNeeded: 2 },
            chamomile: { id: 6, name: 'Chamomile', emoji: '🌼', growthTime: 4, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            chicory: { id: 7, name: 'Chicory', emoji: '🌿', growthTime: 5, basePrice: 18, seedCost: 7, waterNeeded: 2 },
            dandelion: { id: 8, name: 'Dandelion', emoji: '🌻', growthTime: 3, basePrice: 12, seedCost: 4, waterNeeded: 2 },
            echinacea: { id: 9, name: 'Echinacea', emoji: '🌺', growthTime: 6, basePrice: 35, seedCost: 12, waterNeeded: 2 },
            elecampane: { id: 10, name: 'Elecampane', emoji: '🌻', growthTime: 6, basePrice: 26, seedCost: 10, waterNeeded: 2 },
            feverfew: { id: 11, name: 'Feverfew', emoji: '🌼', growthTime: 4, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            grindelia: { id: 12, name: 'Grindelia', emoji: '🌻', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 1 },
            milk_thistle: { id: 13, name: 'Milk Thistle', emoji: '🌺', growthTime: 6, basePrice: 30, seedCost: 11, waterNeeded: 1 },
            safflower: { id: 14, name: 'Safflower', emoji: '🌻', growthTime: 5, basePrice: 24, seedCost: 9, waterNeeded: 2 },
            stevia: { id: 15, name: 'Stevia', emoji: '🌿', growthTime: 4, basePrice: 24, seedCost: 9, waterNeeded: 3 },
            tansy: { id: 16, name: 'Tansy', emoji: '🌼', growthTime: 5, basePrice: 20, seedCost: 7, waterNeeded: 2 },
            tarragon: { id: 17, name: 'Tarragon', emoji: '🌿', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            wormwood: { id: 18, name: 'Wormwood', emoji: '🌿', growthTime: 5, basePrice: 26, seedCost: 10, waterNeeded: 1 },
            yarrow: { id: 19, name: 'Yarrow', emoji: '🌼', growthTime: 4, basePrice: 20, seedCost: 7, waterNeeded: 1 }
        },
        
        // FABACEAE FAMILY (27 plants) - Nitrogen fixers, help heavy feeders
        Fabaceae: {
            alfalfa: { id: 20, name: 'Alfalfa', emoji: '🌿', growthTime: 4, basePrice: 15, seedCost: 5, waterNeeded: 2 },
            astragalus: { id: 21, name: 'Astragalus', emoji: '🌿', growthTime: 8, basePrice: 45, seedCost: 18, waterNeeded: 2 },
            fenugreek: { id: 22, name: 'Fenugreek', emoji: '🌿', growthTime: 4, basePrice: 16, seedCost: 6, waterNeeded: 2 },
            kudzu: { id: 23, name: 'Kudzu', emoji: '🌿', growthTime: 4, basePrice: 20, seedCost: 7, waterNeeded: 3 },
            licorice: { id: 24, name: 'Licorice', emoji: '🌿', growthTime: 8, basePrice: 35, seedCost: 13, waterNeeded: 2 },
            red_clover: { id: 25, name: 'Red Clover', emoji: '🌸', growthTime: 4, basePrice: 18, seedCost: 6, waterNeeded: 2 },
            senna: { id: 26, name: 'Senna', emoji: '🌿', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            soy: { id: 27, name: 'Soy', emoji: '🌿', growthTime: 6, basePrice: 20, seedCost: 7, waterNeeded: 3 }
        },
        
        // LAMIACEAE FAMILY (23 plants) - Aromatic pest deterrents
        Lamiaceae: {
            basil: { id: 28, name: 'Basil', emoji: '🌿', growthTime: 3, basePrice: 12, seedCost: 4, waterNeeded: 2 },
            catnip: { id: 29, name: 'Catnip', emoji: '🌿', growthTime: 3, basePrice: 15, seedCost: 5, waterNeeded: 2 },
            horehound: { id: 30, name: 'Horehound', emoji: '🌿', growthTime: 5, basePrice: 20, seedCost: 7, waterNeeded: 1 },
            hyssop: { id: 31, name: 'Hyssop', emoji: '💜', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            lavender: { id: 32, name: 'Lavender', emoji: '💜', growthTime: 6, basePrice: 28, seedCost: 10, waterNeeded: 1 },
            lemon_balm: { id: 33, name: 'Lemon Balm', emoji: '🌿', growthTime: 4, basePrice: 18, seedCost: 6, waterNeeded: 2 },
            marjoram: { id: 34, name: 'Marjoram', emoji: '🌿', growthTime: 4, basePrice: 16, seedCost: 6, waterNeeded: 2 },
            motherwort: { id: 35, name: 'Motherwort', emoji: '🌿', growthTime: 5, basePrice: 22, seedCost: 8, waterNeeded: 2 },
            oregano: { id: 36, name: 'Oregano', emoji: '🌿', growthTime: 4, basePrice: 16, seedCost: 5, waterNeeded: 1 },
            patchouli: { id: 37, name: 'Patchouli', emoji: '🌿', growthTime: 6, basePrice: 30, seedCost: 12, waterNeeded: 3 },
            pennyroyal: { id: 38, name: 'Pennyroyal', emoji: '🌿', growthTime: 4, basePrice: 18, seedCost: 7, waterNeeded: 2 },
            peppermint: { id: 39, name: 'Peppermint', emoji: '🌿', growthTime: 3, basePrice: 14, seedCost: 5, waterNeeded: 3 },
            rosemary: { id: 40, name: 'Rosemary', emoji: '🌿', growthTime: 6, basePrice: 20, seedCost: 7, waterNeeded: 1 },
            sage: { id: 41, name: 'Sage', emoji: '🌿', growthTime: 5, basePrice: 18, seedCost: 6, waterNeeded: 1 },
            skullcap: { id: 42, name: 'Skullcap', emoji: '🌿', growthTime: 5, basePrice: 25, seedCost: 9, waterNeeded: 2 },
            spearmint: { id: 43, name: 'Spearmint', emoji: '🌿', growthTime: 3, basePrice: 14, seedCost: 5, waterNeeded: 3 },
            thyme: { id: 44, name: 'Thyme', emoji: '🌿', growthTime: 4, basePrice: 16, seedCost: 5, waterNeeded: 1 },
            tulsi: { id: 45, name: 'Holy Basil', emoji: '🌿', growthTime: 4, basePrice: 25, seedCost: 8, waterNeeded: 2 }
        },
        
        // APIACEAE FAMILY (15 plants) - Umbel flowers attract predators
        Apiaceae: {
            angelica: { id: 46, name: 'Angelica', emoji: '🌿', growthTime: 6, basePrice: 25, seedCost: 9, waterNeeded: 3 },
            anise: { id: 47, name: 'Anise', emoji: '🌿', growthTime: 4, basePrice: 18, seedCost: 6, waterNeeded: 2 },
            caraway: { id: 48, name: 'Caraway', emoji: '🌿', growthTime: 5, basePrice: 20, seedCost: 7, waterNeeded: 2 },
            celery: { id: 49, name: 'Celery', emoji: '🌿', growthTime: 5, basePrice: 18, seedCost: 7, waterNeeded: 3 },
            coriander: { id: 50, name: 'Coriander', emoji: '🌿', growthTime: 3, basePrice: 15, seedCost: 5, waterNeeded: 2 },
            cumin: { id: 51, name: 'Cumin', emoji: '🌿', growthTime: 4, basePrice: 16, seedCost: 6, waterNeeded: 2 },
            dill: { id: 52, name: 'Dill', emoji: '🌿', growthTime: 4, basePrice: 12, seedCost: 4, waterNeeded: 2 },
            fennel: { id: 53, name: 'Fennel', emoji: '🌿', growthTime: 5, basePrice: 14, seedCost: 5, waterNeeded: 2 },
            lovage: { id: 54, name: 'Lovage', emoji: '🌿', growthTime: 6, basePrice: 20, seedCost: 8, waterNeeded: 3 },
            parsley: { id: 55, name: 'Parsley', emoji: '🌿', growthTime: 3, basePrice: 10, seedCost: 3, waterNeeded: 2 }
        },
        
        // HIGH VALUE PLANTS (for economy testing)
        Premium: {
            ginseng: { id: 100, name: 'Ginseng', emoji: '🌿', growthTime: 15, basePrice: 100, seedCost: 40, waterNeeded: 2 },
            saffron: { id: 101, name: 'Saffron', emoji: '🌺', growthTime: 8, basePrice: 120, seedCost: 50, waterNeeded: 2 },
            vanilla: { id: 102, name: 'Vanilla', emoji: '🌿', growthTime: 12, basePrice: 65, seedCost: 26, waterNeeded: 3 },
            goldenseal: { id: 103, name: 'Goldenseal', emoji: '🌿', growthTime: 10, basePrice: 75, seedCost: 30, waterNeeded: 2 },
            sandalwood: { id: 104, name: 'Sandalwood', emoji: '🌳', growthTime: 20, basePrice: 80, seedCost: 35, waterNeeded: 2 }
        }
    },
    
    // Companion relationships based on families
    companions: {
        Asteraceae: ['Apiaceae', 'Brassicaceae', 'Fabaceae'],
        Fabaceae: ['Poaceae', 'Solanaceae', 'Rosaceae'],
        Lamiaceae: ['Solanaceae', 'Rosaceae', 'Brassicaceae'],
        Apiaceae: ['Asteraceae', 'Solanaceae'],
        Premium: ['all'] // Premium plants work with everything
    }
};

// Export for use
if (typeof module !== 'undefined') {
    module.exports = PLANT_DATABASE;
}
