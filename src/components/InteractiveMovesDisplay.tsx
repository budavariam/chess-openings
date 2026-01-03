import React from "react";

interface InteractiveMovesDisplayProps {
  moves: string[];
  maxMoves?: number;
  onMoveClick?: (moveIndex: number) => void;
  className?: string;
}

export function InteractiveMovesDisplay({
  moves,
  maxMoves,
  onMoveClick,
  className = "",
}: InteractiveMovesDisplayProps) {
  if (!moves || moves.length === 0) return <span className={className}>—</span>;

  const movesToShow = maxMoves ? moves.slice(0, maxMoves) : moves;
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < movesToShow.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = movesToShow[i];
    const blackMove = movesToShow[i + 1];

    // Add move number
    elements.push(
      <span key={`num-${i}`} className="text-gray-500 dark:text-gray-500">
        {moveNumber}.
      </span>,
    );

    // Add white move (clickable if callback provided)
    if (onMoveClick) {
      elements.push(
        <button
          key={`white-${i}`}
          onClick={() => onMoveClick(i + 1)}
          className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded px-0.5 transition-colors"
          title={`Go to position after ${whiteMove}`}
        >
          {whiteMove}
        </button>,
      );
    } else {
      elements.push(<span key={`white-${i}`}>{whiteMove}</span>);
    }

    // Add space
    elements.push(<span key={`space1-${i}`}> </span>);

    // Add black move if it exists
    if (blackMove) {
      if (onMoveClick) {
        elements.push(
          <button
            key={`black-${i}`}
            onClick={() => onMoveClick(i + 2)}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded px-0.5 transition-colors"
            title={`Go to position after ${blackMove}`}
          >
            {blackMove}
          </button>,
        );
      } else {
        elements.push(<span key={`black-${i}`}>{blackMove}</span>);
      }

      // Add space after pair
      elements.push(<span key={`space2-${i}`}> </span>);
    }
  }

  return (
    <span className={className}>
      {elements}
      {maxMoves && moves.length > maxMoves && (
        <span className="text-gray-400">
          {" "}
          ... +{moves.length - maxMoves} more
        </span>
      )}
    </span>
  );
}
