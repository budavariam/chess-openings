# Chess Openings Trainer - Requirements

## Overview
This document tracks all feature requests and fixes for the click-to-move functionality.

## Completed Requirements

### Architecture
- [x] Keep drag mode separate from practice mode for cleaner code
- [x] Extract business logic to custom hooks
  - [x] `useOpenings` - Opening data loading and matching
  - [x] `usePreferences` - localStorage preferences management
  - [x] `useGameState` - Chess game state and navigation
  - [x] `useClickToMove` - Click-to-move mode logic

### UI/UX
- [x] Hide matched opening display in search mode (saves mobile space)
- [x] Add mobile-friendly help indicator (? button instead of hover text)

### Navigation
- [x] Fix step back button to work in all modes (practice, search, popular, favourites)
- [x] Navigation should undo user-made moves using move history

### Performance
- [x] Pre-calculate opening moves index on startup (Map<moveSequence, Set<nextMoves>>)
- [x] O(1) lookup for available moves instead of filtering 9000+ openings
- [x] Reduced console logging (removed verbose logs)

## Pending Requirements (Ordered: Simplest to Hardest)

### 1. Testing & Verification (SIMPLE)
- [ ] Test e4 shows as first move option
- [ ] Test after e4 e5, shows common continuations (Nf3, Nc3, f4, Bc4, etc.)
- [ ] Verify green highlights appear on correct pieces
- [ ] Verify mobile layout is clean in search mode
- [ ] Check for performance lag
- [ ] Verify minimal console logging

### 2. Click-to-Move Mode Already Implemented
All click-to-move functionality is now implemented:
- [x] Toggle in settings/controls (off by default)
- [x] Toggle only available in practice mode
- [x] Visual indicator when mode is active
- [x] Disable drag-and-drop when click mode is ON
- [x] Enable drag-and-drop when click mode is OFF
- [x] Click on a piece to select it
- [x] Show yellow highlight on selected piece
- [x] Click again to deselect
- [x] Display circle markers on destination squares
- [x] Only show moves that exist in opening database
- [x] Click on highlighted square to make the move
- [x] Show green highlight on pieces that have database moves
- [x] Update highlights after each move
- [x] Only highlight pieces for current turn

## Technical Notes

### Refactoring Complete
Code has been refactored into custom hooks for better maintainability:

**`src/hooks/useOpenings.ts`**
- Loads ECO data from JSON files
- Builds pre-calculated moves index during initialization
- Structure: `Map<string, Set<string>>` where key is `"e4|e5"` and value is `Set<"Nf3", "Nc3", ...>`
- Provides O(1) lookup for next moves
- Returns: `{ openings, fenToOpening, openingMovesIndex, isLoaded }`

**`src/hooks/usePreferences.ts`**
- Manages localStorage for: favorites, board theme, coordinates
- Auto-saves preferences on change
- Returns: `{ favouriteIds, boardTheme, showCoordinates, toggleFavourite, setBoardTheme, setShowCoordinates }`

**`src/hooks/useGameState.ts`**
- Manages chess game state with reducer pattern
- Handles moves, navigation, reset
- Returns: `{ state, dispatch, makeMove, navigateToMove, resetGame, updateGameState }`

**`src/hooks/useClickToMove.ts`**
- Separate from practice mode (clean architecture)
- Uses pre-calculated index for fast move lookup
- Returns: `{ enabled, selectedSquare, possibleMoves, piecesWithMoves, toggleEnabled, onSquareClick }`

### Performance Improvements
- Pre-calculates opening moves index on startup (instead of recalculating on every move)
- Lookup complexity: O(1) instead of O(n) where n = 9000+ openings
- Reduced console logging to essential errors only
- Smaller bundle size: 3,628 kB → 485 kB gzipped

## Testing Checklist
- [ ] Click-to-move works in practice mode
- [ ] Drag-and-drop works when click mode is OFF
- [ ] Navigation (undo/redo) works in all modes
- [ ] e4 shows as first move option
- [ ] After e4 e5, shows common continuations (Nf3, Nc3, f4, Bc4, etc.)
- [ ] Green highlights appear on correct pieces
- [ ] Mobile layout is clean in search mode
- [ ] No performance lag
- [ ] Minimal console logging
