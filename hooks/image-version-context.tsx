"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useImageVersioning } from "./use-image-version";

// Context for image versioning
type ImageVersioningContextType = ReturnType<typeof useImageVersioning>;
const ImageVersioningContext = createContext<ImageVersioningContextType | null>(
  null
);

// Provider component - no memoization needed since useImageVersioning already returns stable references
const ImageVersioningProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const imageVersioning = useImageVersioning();

  return (
    <ImageVersioningContext.Provider value={imageVersioning}>
      {children}
    </ImageVersioningContext.Provider>
  );
};

// Custom hooks for specific parts of the state
const useImageVersioningContext = () => {
  const context = useContext(ImageVersioningContext);
  if (!context) {
    throw new Error(
      "useImageVersioningContext must be used within ImageVersioningProvider"
    );
  }
  return context;
};

const useImageState = () => {
  const context = useImageVersioningContext();
  return context.imageState;
};

const useUIState = () => {
  const context = useImageVersioningContext();
  return context.uiState;
};

const usePrompts = () => {
  const context = useImageVersioningContext();
  return context.prompts;
};

const useImageActions = () => {
  const {
    addEdit,
    resetToOriginal,
    setCurrent,
    setPrevious,
    setOriginal,
    clearImages,
  } = useImageVersioningContext();
  return {
    addEdit,
    resetToOriginal,
    setCurrent,
    setPrevious,
    setOriginal,
    clearImages,
  };
};

const useUIActions = () => {
  const {
    setLoading,
    setError,
    enterEditMode,
    exitEditMode,
    toggleComparison,
    resetUI,
  } = useImageVersioningContext();
  return {
    setLoading,
    setError,
    enterEditMode,
    exitEditMode,
    toggleComparison,
    resetUI,
  };
};

const usePromptActions = () => {
  const { setGeneratePrompt, setEditPrompt, clearPrompts } =
    useImageVersioningContext();
  return { setGeneratePrompt, setEditPrompt, clearPrompts };
};

const useImageComputed = () => {
  const { getComparisonImages } = useImageVersioningContext();
  return { getComparisonImages };
};

export {
  ImageVersioningProvider,
  useImageVersioningContext,
  useImageState,
  useUIState,
  usePrompts,
  useImageActions,
  useUIActions,
  usePromptActions,
  useImageComputed,
};
