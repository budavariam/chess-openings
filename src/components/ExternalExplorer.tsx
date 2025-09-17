import React, { useCallback } from 'react'
import { toast } from 'react-toastify'
import { Chess } from 'chess.js'
import type { Opening } from '../types'

interface ExternalExplorerProps {
    matchedOpening: Opening | null
    popularMovesIndex: number
    logAction: (action: string, details?: any) => void
}

// Reusable button component
interface ResponsiveButtonProps {
    onClick: () => void
    className: string
    title?: string
    children: React.ReactNode
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({ onClick, className, title, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 sm:py-1.5 py-2 text-sm rounded-md font-medium transition-colors ${className}`}
        title={title}
    >
        {children}
    </button>
)

// Reusable responsive button container
interface ResponsiveButtonGroupProps {
    label: string
    children: React.ReactNode
    mobileLayout?: 'stack' | 'grid'
}

const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
    label,
    children,
    mobileLayout = 'stack'
}) => (
    <div className="space-y-2">
        <span className="block text-sm text-gray-600 dark:text-gray-400 font-medium">
            {label}
        </span>
        {/* Desktop - horizontal layout */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {children}
        </div>
        {/* Mobile - configurable layout */}
        <div className={`sm:hidden ${mobileLayout === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, {
                        className: `${child.props.className} ${mobileLayout === 'stack' ? 'w-full' : ''}`
                    })
                    : child
            )}
        </div>
    </div>
)

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

                    const pgn = [
                        `[Event "${matchedOpening.name}"]`,
                        `[Site "Chess Practice App"]`,
                        `[Date "${new Date().toISOString().split('T')[0]}"]`,
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

    // Shared button styles
    const primaryButtonStyle = "bg-green-600 text-white hover:bg-green-700"
    const secondaryButtonStyle = "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
    const blueButtonStyle = "bg-blue-600 text-white hover:bg-blue-700"

    return (
        <div className="space-y-4">
            {/* External Explorers */}
            <ResponsiveButtonGroup label="Explore:" mobileLayout="stack">
                <ResponsiveButton
                    onClick={() => openInExplorer('chess.com')}
                    className={primaryButtonStyle}
                    title="Open in Chess.com analysis board"
                >
                    Chess.com
                </ResponsiveButton>
                <ResponsiveButton
                    onClick={() => openInExplorer('lichess')}
                    className={secondaryButtonStyle}
                    title="Copy moves for Lichess (opens analysis page)"
                >
                    Lichess
                </ResponsiveButton>
                <ResponsiveButton
                    onClick={() => openInExplorer('365chess')}
                    className={secondaryButtonStyle}
                    title="Copy moves for 365chess (opens main page)"
                >
                    365chess
                </ResponsiveButton>
            </ResponsiveButtonGroup>

            {/* Export Options */}
            <ResponsiveButtonGroup label="Export:" mobileLayout="grid">
                <ResponsiveButton
                    onClick={() => exportData('pgn')}
                    className={blueButtonStyle}
                    title="Export as PGN (complete game data)"
                >
                    PGN
                </ResponsiveButton>
                <ResponsiveButton
                    onClick={() => exportData('san')}
                    className={secondaryButtonStyle}
                    title="Copy moves in Standard Algebraic Notation"
                >
                    SAN
                </ResponsiveButton>
                <ResponsiveButton
                    onClick={() => exportData('fen')}
                    className={secondaryButtonStyle}
                    title="Copy position in Forsyth-Edwards Notation"
                >
                    FEN
                </ResponsiveButton>
                <ResponsiveButton
                    onClick={() => exportData('uci')}
                    className={secondaryButtonStyle}
                    title="Export for chess engines (UCI format)"
                >
                    UCI
                </ResponsiveButton>
            </ResponsiveButtonGroup>
        </div>
    )
}
