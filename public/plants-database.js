// plants-database.js - Your complete plant knowledge system

const plantsDatabase = [
  {
    // Basic identification
    id: 1,
    commonName: "Cuachalalate",
    scientificName: "Amphipterygium adstringens",
    authors: "(Schltdl.) Schult. f.",
    family: "Anacardiaceae",
    
    // Game mechanics
    gameData: {
      emoji: "🌳",
      growthTime: 180, // seconds
      basePrice: 50,
      sellPrice: 150,
      rarity: "rare",
      biome: "dry_forest",
      unlockLevel: 5
    },
    
    // BOTANICAL IDENTIFICATION section
    botanicalIdentification: {
      commonNames: ["Cuachalalate", "Matlacual", "Cascara de la tierra"],
      nativeRange: "Mexico's dry forests and mountainous regions",
      description: "Small deciduous tree, native to Mexico's dry forests and mountainous regions, grows up to 6 meters tall. Features leathery leaves and rough bark, which is manually harvested and dried for traditional medicine.",
      partsUsed: "Bark (primary), occasionally leaves",
      harvestableParts: ["bark"],
      physicalCharacteristics: {
        height: "up to 6 meters",
        bark: "rough, gray-brown",
        leaves: "leathery, compound",
        habitat: "dry forests, mountainous regions 500-1500m elevation"
      }
    },
    
    // CULTURAL AND HISTORICAL USE section
    culturalUse: {
      traditions: ["Mexican traditional medicine", "Nahua herbalism"],
      centuriesOfUse: 5,
      primaryUses: [
        "Bark infusions and decoctions treat gastric ulcers, gastritis, and stomach cancer",
        "Applied topically or as a rinse for mouth sores, gingivitis, and skin infections",
        "Used in postpartum care to tone reproductive tissues",
        "Recognized in modern herbal pharmacies across Mexico"
      ],
      indigenousProtocols: {
        harvesting: "Harvest bark in vertical strips from mature trees only",
        offering: "Traditional offering before harvest",
        season: "Best harvested in dry season",
        sustainability: "Never girdle the tree, allow 3-5 years recovery"
      },
      historicalNotes: "Used for centuries in Mexican traditional medicine, especially among Nahua and rural herbalists"
    },
    
    // KEY BIOACTIVE COMPOUNDS & BENEFITS table
    bioactiveCompounds: [
      {
        compound: "Triterpenes",
        location: "Bark",
        humanBenefit: "Gastroprotective, anti-inflammatory",
        plantRole: "Defense against herbivory"
      },
      {
        compound: "Anacardic acids",
        location: "Bark and resin",
        humanBenefit: "Antimicrobial, cytotoxic to cancer cells",
        plantRole: "Antipathogenic"
      },
      {
        compound: "Flavonoids",
        location: "Bark",
        humanBenefit: "Antioxidant, anti-ulcer",
        plantRole: "UV and stress protection"
      },
      {
        compound: "Tannins",
        location: "Bark",
        humanBenefit: "Astringent, promotes tissue repair",
        plantRole: "Protection and wound sealing"
      }
    ],
    
    // HOW IT WORKS IN THE BODY section
    mechanisms: {
      gastroprotection: "Triterpenoids coat and protect gastric mucosa, preventing ulceration and promoting repair",
      astringency: "Tannins tighten and seal tissues, aiding in oral, digestive, and skin healing",
      antiInflammatory: "Polyphenols reduce inflammatory response in mucosal linings",
      antimicrobial: "Anacardic acids inhibit bacterial growth, especially Helicobacter pylori"
    },
    
    // DOSE GUIDELINES table
    dosageGuidelines: [
      {
        preparation: "Bark decoction",
        typicalDose: "5-10 g per 500 mL water, simmered",
        purpose: "Gastric ulcers, digestive inflammation",
        frequency: "2-3 times daily before meals"
      },
      {
        preparation: "Bark powder capsule",
        typicalDose: "250-500 mg, 1-2x daily",
        purpose: "Chronic mucosal irritation, oral support",
        frequency: "With meals"
      },
      {
        preparation: "Oral rinse",
        typicalDose: "5 g bark in 250 mL water (swish, spit)",
        purpose: "Gingivitis, mouth sores",
        frequency: "2-3 times daily after brushing"
      }
    ],
    
    // PREPARATION AND USES section
    preparations: {
      decoction: {
        method: "Simmer dried bark 10-20 minutes",
        use: "Internal use for gastric or liver complaints",
        ratio: "1:50 bark to water"
      },
      oralRinse: {
        method: "Cooled decoction",
        use: "Antiseptic mouthwash",
        duration: "Swish 30-60 seconds"
      },
      capsules: {
        method: "Powdered bark in capsules",
        use: "Convenience and standardized dosing",
        storage: "Keep in cool, dry place"
      },
      combinations: [
        "Often combined with calendula, licorice, or chamomile in GI blends",
        "Pairs well with slippery elm for mucosal protection"
      ]
    },
    
    // OPTIMAL CONTEXT FOR USE section
    optimalUse: {
      indications: [
        "Gastritis, ulcers, or acid reflux",
        "Gingivitis and mouth ulcers",
        "Recovery from surgery or childbirth",
        "Adjunctive care in gastric or esophageal cancer (under supervision)"
      ],
      bestResults: "Take on empty stomach for gastric issues, after meals for maintenance",
      duration: "Acute: 2-4 weeks, Chronic: under practitioner guidance"
    },
    
    // SUSTAINABILITY section
    sustainability: {
      conservationStatus: "Threatened by overharvesting",
      ethicalSourcing: [
        "Source from regulated cultivators",
        "Bark should be harvested from mature trees only",
        "Harvest in vertical strips to prevent girdling",
        "Listed in Mexican official herbal pharmacopoeia"
      ],
      cultivation: "Community projects support reforestation and cultivation in native ranges",
      alternatives: "Consider cultivated sources or similar species when wild populations are stressed"
    },
    
    // SAFETY AND CAUTIONS section
    safety: {
      generalSafety: "Generally well tolerated",
      contraindications: [
        "Avoid in pregnancy due to astringent uterine effects"
      ],
      drugInteractions: [
        "May interfere with absorption of medications if taken simultaneously due to mucosal coating"
      ],
      sideEffects: ["Possible constipation with high doses"],
      maxDuration: "Not recommended for long-term high-dose use without supervision",
      specialPopulations: {
        pregnancy: "Contraindicated",
        lactation: "Insufficient data",
        children: "Use with caution, reduce dose",
        elderly: "Generally safe"
      }
    },
    
    // CLINICAL RESEARCH section
    clinicalResearch: [
      {
        year: 2001,
        authors: "Pérez, R. M. et al.",
        journal: "Journal of Ethnopharmacology",
        title: "Gastroprotective activity of Amphipterygium adstringens",
        findings: "Significant reduction in gastric lesions in animal models",
        dosage: "100-300 mg/kg body weight"
      }
    ],
    
    // REFERENCES section
    references: [
      "Lozoya, X. (1994). Plantas Medicinales de México",
      "Pérez, R. M. et al. (2001). 'Gastroprotective activity of Amphipterygium adstringens.' Journal of Ethnopharmacology",
      "Secretaría de Salud (2001). Farmacopea Herbolaria de los Estados Unidos Mexicanos"
    ],
    
    // PRACTITIONER NOTES (your personal observations)
    practitionerNotes: {
      personalExperience: "Excellent results with chronic gastritis patients",
      clientFeedback: [
        "Most effective when combined with dietary changes",
        "Oral rinse shows results within 3-5 days for gingivitis"
      ],
      clinicalObservations: "Best taken as warm decoction rather than capsules for acute gastric pain",
      combinations: "Works synergistically with marshmallow root",
      localSources: "Available from Mountain Rose Herbs, Pacific Botanicals"
    }
  },
  
  // Add your next plant here with the same structure
  {
    id: 2,
    commonName: "White Willow",
    scientificName: "Salix alba",
    // ... continue with full structure
  }
];

// Function to display plant information in game
function displayPlantInfo(plantId) {
  const plant = plantsDatabase.find(p => p.id === plantId);
  if (!plant) return '';
  
  return `
    <div class="plant-full-info">
      <!-- Header -->
      <div class="plant-header">
        <h1>${plant.commonName.toUpperCase()}</h1>
        <div class="scientific-name">${plant.scientificName} ${plant.authors || ''}</div>
        <div class="family">Family: ${plant.family}</div>
      </div>
      
      <!-- Botanical Identification -->
      <section class="info-section">
        <h2>BOTANICAL IDENTIFICATION</h2>
        <p><strong>Common Names:</strong> ${plant.botanicalIdentification.commonNames.join(', ')}</p>
        <p>${plant.botanicalIdentification.description}</p>
        <p><strong>Parts Used:</strong> ${plant.botanicalIdentification.partsUsed}</p>
      </section>
      
      <!-- Cultural and Historical Use -->
      <section class="info-section">
        <h2>CULTURAL AND HISTORICAL USE</h2>
        <ul>
          ${plant.culturalUse.primaryUses.map(use => `<li>${use}</li>`).join('')}
        </ul>
        <p class="historical-note">${plant.culturalUse.historicalNotes}</p>
      </section>
      
      <!-- Bioactive Compounds Table -->
      <section class="info-section">
        <h2>KEY BIOACTIVE COMPOUNDS & BENEFITS</h2>
        <table class="compounds-table">
          <thead>
            <tr>
              <th>Compound/Class</th>
              <th>Location</th>
              <th>Human Benefit</th>
              <th>Role in Plant</th>
            </tr>
          </thead>
          <tbody>
            ${plant.bioactiveCompounds.map(c => `
              <tr>
                <td><strong>${c.compound}</strong></td>
                <td>${c.location}</td>
                <td>${c.humanBenefit}</td>
                <td>${c.plantRole}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
      
      <!-- How It Works -->
      <section class="info-section">
        <h2>HOW IT WORKS IN THE BODY</h2>
        ${Object.entries(plant.mechanisms).map(([key, value]) => 
          `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> ${value}</p>`
        ).join('')}
      </section>
      
      <!-- Dosage Guidelines -->
      <section class="info-section">
        <h2>DOSE GUIDELINES</h2>
        <table class="dosage-table">
          <thead>
            <tr>
              <th>Preparation Type</th>
              <th>Typical Dose</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            ${plant.dosageGuidelines.map(d => `
              <tr>
                <td>${d.preparation}</td>
                <td>${d.typicalDose}</td>
                <td>${d.purpose}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
      
      <!-- Preparation and Uses -->
      <section class="info-section">
        <h2>PREPARATION AND USES</h2>
        ${Object.entries(plant.preparations).map(([key, prep]) => {
          if (Array.isArray(prep)) {
            return prep.map(p => `<p>• ${p}</p>`).join('');
          } else if (prep.method) {
            return `
              <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> 
              ${prep.method} for ${prep.use}</p>
            `;
          }
          return '';
        }).join('')}
      </section>
      
      <!-- Optimal Context -->
      <section class="info-section">
        <h2>OPTIMAL CONTEXT FOR USE</h2>
        <ul>
          ${plant.optimalUse.indications.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <p><strong>Best Results:</strong> ${plant.optimalUse.bestResults}</p>
      </section>
      
      <!-- Sustainability -->
      <section class="info-section">
        <h2>SUSTAINABILITY AND ETHICAL HARVESTING</h2>
        <p><strong>Conservation Status:</strong> ${plant.sustainability.conservationStatus}</p>
        <ul>
          ${plant.sustainability.ethicalSourcing.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </section>
      
      <!-- Safety -->
      <section class="info-section safety-section">
        <h2>SAFETY AND CAUTIONS</h2>
        <p>${plant.safety.generalSafety}</p>
        ${plant.safety.contraindications.length > 0 ? 
          `<p class="warning"><strong>Contraindications:</strong> ${plant.safety.contraindications.join(', ')}</p>` : ''
        }
        ${plant.safety.drugInteractions.length > 0 ?
          `<p class="warning"><strong>Drug Interactions:</strong> ${plant.safety.drugInteractions.join(', ')}</p>` : ''
        }
      </section>
      
      <!-- References -->
      <section class="info-section">
        <h2>REFERENCES</h2>
        <ul class="references">
          ${plant.references.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </section>
      
      <!-- Practitioner Notes (if any) -->
      ${plant.practitionerNotes ? `
        <section class="info-section practitioner-notes">
          <h2>PRACTITIONER NOTES</h2>
          <p>${plant.practitionerNotes.personalExperience}</p>
          ${plant.practitionerNotes.clientFeedback.map(f => `<p>• ${f}</p>`).join('')}
        </section>
      ` : ''}
    </div>
  `;
}

// CSS styles for the plant information display
const plantInfoStyles = `
  .plant-full-info {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #1a3d34;
    color: #e0f2e9;
  }
  
  .plant-header {
    text-align: center;
    border-bottom: 3px solid #22c55e;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  
  .plant-header h1 {
    color: #4ade80;
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .scientific-name {
    font-style: italic;
    color: #94a3b8;
    font-size: 18px;
  }
  
  .info-section {
    margin: 30px 0;
    padding: 20px;
    background: rgba(34, 197, 94, 0.05);
    border-left: 3px solid #22c55e;
    border-radius: 5px;
  }
  
  .info-section h2 {
    color: #4ade80;
    font-size: 18px;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(34, 197, 94, 0.3);
    padding-bottom: 10px;
  }
  
  .compounds-table, .dosage-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  .compounds-table th, .dosage-table th {
    background: rgba(34, 197, 94, 0.2);
    padding: 10px;
    text-align: left;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  .compounds-table td, .dosage-table td {
    padding: 10px;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
  
  .safety-section {
    background: rgba(239, 68, 68, 0.05);
    border-left-color: #ef4444;
  }
  
  .warning {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
  }
  
  .references {
    font-size: 14px;
    opacity: 0.9;
  }
  
  .practitioner-notes {
    background: rgba(168, 85, 247, 0.05);
    border-left-color: #a855f7;
  }
`;

// Export for use in your game
export { plantsDatabase, displayPlantInfo, plantInfoStyles };// This is JavaScript code that goes INSIDE the file
const plantsDatabase = [
  {
    id: 1,
    commonName: "Cuachalalate",
    // ... rest of the code
  }
];
