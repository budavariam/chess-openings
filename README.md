# Chess Openings Trainer

A React + Vite + Tailwind app for studying chess openings. It uses:
- `react-chessboard` for the interactive board
- `chess.js` for game logic
- `eco.json` package as the openings database
- `chess-tools` as an optional helper for opening classification

Features:
- Practice mode: move pieces and the app will attempt to match the opening from `eco.json`
- Popular mode: browse openings sorted by popularity and step through moves with a stepper

## Notes
- This project references the `eco.json` and `chess-tools` npm packages. Install dependencies with `npm install` or `pnpm install`.
- If any package exposes different APIs, you may need to adapt the import lines in `src/components/ChessPractice.tsx`.

## Run
```bash
npm install
npm run dev
```

# chess-openings
