export type Opening = {
  name: string
  eco?: string
  moves: string[]
  popularity: number
  fen: string
  src?: string // eco_tsv, eco_js, scid, interpolated
  scid?: string
  isEcoRoot?: boolean
  aliases?: Record<string, string>
}

export type ChessMode = 'practice' | 'popular' | 'search' | 'favourites'

export type BoardOrientation = 'white' | 'black'

export interface ChessGameState {
  game: any // Chess instance
  moveHistory: string[]
  matchedOpening: Opening | null
  isPlayingOpening: boolean
  popularIndex: number
  popularMovesIndex: number
}

export interface UIState {
  mode: ChessMode
  boardOrientation: BoardOrientation
  searchQuery: string
  searchResults: Opening[]
}
