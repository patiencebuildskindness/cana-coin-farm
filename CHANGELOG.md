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
