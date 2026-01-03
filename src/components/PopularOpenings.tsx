import React from "react";
import type { Opening, ChessMode } from "../types";
import { OpeningItem, getOpeningId } from "./OpeningItem";

interface OpeningsListProps {
  title: string;
  subtitle?: string;
  moveHistory: string[];
  openings: Opening[];
  startPopularAt: (index: number, startAtFinalPosition?: boolean) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds: string[];
  mode?: ChessMode;
  maxItems?: number;
  onMoveClick?: (opening: Opening, moveIndex: number) => void;
}

export const OpeningsList: React.FC<OpeningsListProps> = ({
  title,
  subtitle,
  moveHistory,
  openings,
  startPopularAt,
  toggleFavourite,
  favouriteIds,
  mode = "popular",
  maxItems = 20,
  onMoveClick,
}) => {
  const handleStudyOpening = (opening: Opening, startAtFinalPosition?: boolean) => {
    const index = openings.findIndex(
      (o) => getOpeningId(o) === getOpeningId(opening),
    );
    if (index !== -1) {
      startPopularAt(index, startAtFinalPosition);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
        {subtitle && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            {subtitle}
          </span>
        )}
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {openings.slice(0, maxItems).map((opening, index) => {
          const openingId = getOpeningId(opening);
          const isFavourite = favouriteIds.includes(openingId);

          return (
            <OpeningItem
              key={openingId}
              opening={opening}
              isFavourite={isFavourite}
              toggleFavourite={toggleFavourite}
              onStudy={handleStudyOpening}
              variant="list"
              mode={mode}
              showIndex={index + 1}
              onMoveClick={onMoveClick}
            />
          );
        })}
        {openings.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No openings found
          </div>
        )}
      </div>
    </div>
  );
};

interface PopularOpeningsProps {
  moveHistory: string[];
  popularSorted: Opening[];
  startPopularAt: (index: number, startAtFinalPosition?: boolean) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds: string[];
  mode?: ChessMode;
  onMoveClick?: (opening: Opening, moveIndex: number) => void;
}

export const PopularOpenings: React.FC<PopularOpeningsProps> = (props) => {
  const subtitle = props.moveHistory.length > 0
    ? "(filtered by current position)"
    : undefined;

  return (
    <OpeningsList
      title="Popular Openings"
      subtitle={subtitle}
      openings={props.popularSorted}
      {...props}
    />
  );
};
