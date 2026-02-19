import { useState, useEffect } from "react";
import { useToast } from "./useToast";

export interface Preferences {
  favouriteIds: string[];
  boardTheme: string;
  showCoordinates: boolean;
  toggleFavourite: (openingId: string) => void;
  setBoardTheme: (theme: string) => void;
  setShowCoordinates: (show: boolean) => void;
}

export function usePreferences(): Preferences {
  const [favouriteIds, setFavouriteIds] = useState<string[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("chess-opening-favourites");
        return saved ? JSON.parse(saved) : [];
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error);
    }
    return [];
  });

  const [boardTheme, setBoardThemeState] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("chess-board-theme") || "default";
      }
    } catch (error) {
      console.error("Failed to load board theme from localStorage:", error);
    }
    return "default";
  });

  const [showCoordinates, setShowCoordinatesState] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("chess-show-coordinates");
        if (saved === null) return false;
        return saved === "true";
      }
    } catch (error) {
      console.error("Failed to load coordinates preference from localStorage:", error);
    }
    return false;
  });

  const toast = useToast();

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "chess-opening-favourites",
        JSON.stringify(favouriteIds),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to save favorites:", message);
    }
  }, [favouriteIds]);

  // Save board theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chess-board-theme", boardTheme);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to save board theme:", message);
    }
  }, [boardTheme]);

  // Save coordinates preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chess-show-coordinates", String(showCoordinates));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Failed to save coordinates preference:", message);
    }
  }, [showCoordinates]);

  const toggleFavourite = (openingId: string) => {
    try {
      const isCurrentlyFavourite = favouriteIds.includes(openingId);
      if (isCurrentlyFavourite) {
        setFavouriteIds(favouriteIds.filter((id) => id !== openingId));
        toast.info("Removed from favorites");
      } else {
        setFavouriteIds([...favouriteIds, openingId]);
        toast.success("Added to favorites");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to toggle favorite: ${message}`);
    }
  };

  const setBoardTheme = (theme: string) => {
    try {
      setBoardThemeState(theme);
      toast.success(`Changed board theme to ${theme}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to change theme: ${message}`);
    }
  };

  const setShowCoordinates = (show: boolean) => {
    try {
      setShowCoordinatesState(show);
      toast.success(`${show ? "Enabled" : "Disabled"} board coordinates`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to toggle coordinates: ${message}`);
    }
  };

  return {
    favouriteIds,
    boardTheme,
    showCoordinates,
    toggleFavourite,
    setBoardTheme,
    setShowCoordinates,
  };
}
