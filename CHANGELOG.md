# CANA Coin Farm - Changelog

## Version 1.1.0 - Save System (Current)
### Added
- Complete save/load system with localStorage
- Auto-save every 30 seconds
- Save on important actions (harvest, buy, expand, sleep)
- Manual save button with visual feedback
- Export/import save files for backup
- Delete save option with confirmation
- Visual save indicator in top-right corner
- "Last saved" time display

### Technical
- Save data includes: character position/energy, coins, day/season, inventory, all plot states
- Graceful error handling for save failures
- Save versioning for future compatibility

## Version 1.0.0 - MVP
### Features
- Character movement (WASD/Arrow keys)
- 10x10 expandable farm grid
- 10 starter plants
- Planting, watering, harvesting
- Dynamic market pricing
- Day/season system
- Energy management

## Version 1.2.0 - Companion Planting System
### Added
- Complete companion planting mechanics
- 20% growth speed bonus per companion neighbor
- 15% harvest value bonus per companion
- Antagonist penalties reduce growth by 15%
- Visual indicators (green/red glow, icons)
- All 10 plants have realistic companion/antagonist relationships
- Market shows companion information
- Plot info displays planting recommendations

### Gameplay Impact
- Strategic depth - placement matters!
- Higher profits from smart planting
- Educational - teaches real permaculture principles
- Risk/reward - antagonists can ruin crops

### Technical
- Automatic companion bonus calculation
- Saves/loads companion data
- Dynamic recalculation when plants change
