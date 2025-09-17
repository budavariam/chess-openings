import React, { useCallback } from 'react'
import { toast } from 'react-toastify'
import { Chess } from 'chess.js'
import type { Opening } from '../types'

interface ExternalExplorerProps {
    matchedOpening: Opening | null
    popularMovesIndex: number
    logAction: (action: string, details?: any) => void
}

export const ExternalExplorer: React.FC<ExternalExplorerProps> = ({
    matchedOpening,
    popularMovesIndex,
    logAction
}) => {
    const generateChessComLink = useCallback((moves: string[]): string => {
        if (moves.length === 0) {
            return 'https://www.chess.com/analysis'
        }

        const pgnMoves = moves.join(' ')
        const encodedMoves = encodeURIComponent(pgnMoves)
        return `https://www.chess.com/analysis?pgn=${encodedMoves}`
    }, [])

    const openInExplorer = useCallback((site: 'lichess' | 'chess.com' | '365chess') => {
        if (!matchedOpening) {
            toast.error('No opening selected')
            return
        }

        const moves = matchedOpening.moves.slice(0, popularMovesIndex || matchedOpening.moves.length)
        console.log("Moves to send:", moves, matchedOpening.moves);
        let url: string

        switch (site) {
            case 'lichess':
                const moveText = moves.join(' ')
                navigator.clipboard?.writeText(moveText).then(() => {
                    toast.info(`Lichess - moves copied to clipboard: ${moveText}`)
                }).catch(() => {
                    toast.info(`Search for: ${moveText} on Lichess`)
                })
                url = 'https://lichess.org/analysis'
                break
            case 'chess.com':
                url = generateChessComLink(moves)
                toast.info(`Opening ${matchedOpening.name} in Chess.com`)
                break
            case '365chess':
                url = 'https://www.365chess.com/opening.php'
                const moveText365 = moves.join(' ')
                navigator.clipboard?.writeText(moveText365).then(() => {
                    toast.info(`365chess - moves copied to clipboard: ${moveText365}`)
                }).catch(() => {
                    toast.info(`Search for: ${moveText365} on 365chess`)
                })
                break
            default:
                url = 'https://lichess.org/analysis'
        }

        window.open(url, '_blank')
        logAction('Opened external explorer', {
            site,
            movesCount: moves.length,
            opening: matchedOpening.name,
            moves: moves.join(' ')
        })
    }, [matchedOpening, popularMovesIndex, generateChessComLink, logAction])

    const exportData = useCallback((format: 'san' | 'fen' | 'pgn' | 'uci') => {
        if (!matchedOpening) {
            toast.error('No opening selected')
            return
        }

        const moves = matchedOpening.moves.slice(0, popularMovesIndex || matchedOpening.moves.length)

        try {
            switch (format) {
                case 'san':
                    const sanMoves = moves.join(' ')
                    navigator.clipboard?.writeText(sanMoves).then(() => {
                        toast.success(`SAN moves copied: ${sanMoves}`)
                    }).catch(() => {
                        toast.info(`SAN moves: ${sanMoves}`)
                    })

                    logAction('Exported SAN moves', {
                        opening: matchedOpening.name,
                        movesCount: moves.length,
                        moves: sanMoves
                    })
                    break

                case 'fen':
                    const game = new Chess()
                    for (const move of moves) {
                        const result = game.move(move)
                        if (!result) {
                            toast.error(`Invalid move: ${move}`)
                            return
                        }
                    }

                    const fen = game.fen()
                    navigator.clipboard?.writeText(fen).then(() => {
                        toast.success('FEN position copied to clipboard')
                    }).catch(() => {
                        toast.info(`FEN: ${fen}`)
                    })

                    logAction('Exported FEN position', {
                        opening: matchedOpening.name,
                        movesCount: moves.length,
                        fen: fen
                    })
                    break

                case 'pgn':
                    const gameForPgn = new Chess()
                    for (const move of moves) {
                        const result = gameForPgn.move(move)
                        if (!result) {
                            toast.error(`Invalid move: ${move}`)
                            return
                        }
                    }

                    // Create PGN with headers
                    const pgn = [
                        `[Event "${matchedOpening.name}"]`,
                        `[Site "Chess Practice App"]`,
                        `[Date "${new Date().toISOString().split('T')}"]`,
                        `[White "Study"]`,
                        `[Black "Opening"]`,
                        `[Result "*"]`,
                        `[ECO "${matchedOpening.eco || ''}"]`,
                        `[Opening "${matchedOpening.name}"]`,
                        '',
                        gameForPgn.pgn(),
                        ''
                    ].join('\n')

                    navigator.clipboard?.writeText(pgn).then(() => {
                        toast.success('PGN copied to clipboard')
                    }).catch(() => {
                        toast.info('PGN export ready')
                    })

                    logAction('Exported PGN', {
                        opening: matchedOpening.name,
                        movesCount: moves.length,
                        eco: matchedOpening.eco
                    })
                    break

                case 'uci':
                    // UCI format for engine analysis (long algebraic notation)
                    const gameForUci = new Chess()
                    const uciMoves: string[] = []

                    for (const sanMove of moves) {
                        const moveObj = gameForUci.move(sanMove)
                        if (!moveObj) {
                            toast.error(`Invalid move: ${sanMove}`)
                            return
                        }
                        uciMoves.push(moveObj.from + moveObj.to + (moveObj.promotion || ''))
                    }

                    const uciString = `position startpos moves ${uciMoves.join(' ')}`
                    navigator.clipboard?.writeText(uciString).then(() => {
                        toast.success('UCI notation copied to clipboard')
                    }).catch(() => {
                        toast.info(`UCI: ${uciString}`)
                    })

                    logAction('Exported UCI notation', {
                        opening: matchedOpening.name,
                        movesCount: moves.length,
                        uci: uciString
                    })
                    break
            }
        } catch (error: any) {
            const errorMessage = error?.message || String(error)
            toast.error(`Export failed: ${errorMessage}`)
            logAction('ERROR: Export failed', { format, error: errorMessage })
        }
    }, [matchedOpening, popularMovesIndex, logAction])

    if (!matchedOpening) {
        return null
    }

    return (
        <div className="space-y-3">
            {/* External Explorers */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Explore:
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => openInExplorer('chess.com')}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium cursor-pointer"
                        title="Open in Chess.com analysis board"
                    >
                        Chess.com
                    </button>
                    <button
                        onClick={() => openInExplorer('lichess')}
                        className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-400 text-black rounded-md font-medium cursor-pointer"
                        title="Copy moves for Lichess (opens analysis page)"
                    >
                        Lichess
                    </button>
                    <button
                        onClick={() => openInExplorer('365chess')}
                        className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-400 text-black rounded-md font-medium cursor-pointer"
                        title="Copy moves for 365chess (opens main page)"
                    >
                        365chess
                    </button>
                </div>
            </div>

            {/* Export Options */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Export:
                </span>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => exportData('pgn')}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                        title="Export as PGN (complete game data)"
                    >
                        PGN
                    </button>
                    <button
                        onClick={() => exportData('san')}
                        className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-400 text-black rounded-md font-medium cursor-pointer"
                        title="Copy moves in Standard Algebraic Notation"
                    >
                        SAN
                    </button>
                    <button
                        onClick={() => exportData('fen')}
                        className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-400 text-black rounded-md font-medium cursor-pointer"
                        title="Copy position in Forsyth-Edwards Notation"
                    >
                        FEN
                    </button>
                    <button
                        onClick={() => exportData('uci')}
                        className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-400 text-black rounded-md font-medium cursor-pointer"
                        title="Export for chess engines (UCI format)"
                    >
                        UCI
                    </button>
                </div>
            </div>
        </div>
    )
}
