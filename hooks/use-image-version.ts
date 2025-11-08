import { startTransition, useCallback, useMemo, useReducer } from "react";
import type { ImageData } from "../lib/utils/image-utils";

export type ImageState = {
  current: ImageData | null;
  previous: ImageData | null;
  original: ImageData | null;
  hasBeenEdited: boolean;
};

export type UIState = {
  isLoading: boolean;
  error: string | null;
  isEditMode: boolean;
  showComparison: boolean;
};

export type Prompts = {
  generate: string;
  edit: string;
};

// Action types
type ImageAction =
  | { type: "SET_CURRENT"; payload: ImageData }
  | { type: "SET_PREVIOUS"; payload: ImageData }
  | { type: "SET_ORIGINAL"; payload: ImageData }
  | { type: "ADD_EDIT"; payload: ImageData }
  | { type: "RESET_TO_ORIGINAL" }
  | { type: "CLEAR_IMAGES" };

type UIAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EDIT_MODE"; payload: boolean }
  | { type: "SET_SHOW_COMPARISON"; payload: boolean }
  | { type: "RESET_UI" };

type PromptAction =
  | { type: "SET_GENERATE_PROMPT"; payload: string }
  | { type: "SET_EDIT_PROMPT"; payload: string }
  | { type: "CLEAR_PROMPTS" };

// Reducers
const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case "SET_CURRENT":
      return { ...state, current: action.payload };
    case "SET_PREVIOUS":
      return { ...state, previous: action.payload };
    case "SET_ORIGINAL":
      return { ...state, original: action.payload };
    case "ADD_EDIT":
      return {
        ...state,
        previous: state.current, // Move current to previous
        current: action.payload, // Set new edit as current
        hasBeenEdited: true,
      };
    case "RESET_TO_ORIGINAL":
      return {
        ...state,
        current: state.original,
        previous: null,
        hasBeenEdited: false,
      };
    case "CLEAR_IMAGES":
      return {
        ...state,
        current: null,
        previous: null,
        original: null,
        hasBeenEdited: false,
      };
    default:
      return state;
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EDIT_MODE":
      return {
        ...state,
        isEditMode: action.payload,
        showComparison: action.payload ? true : state.showComparison, // Auto-enable comparison in edit mode
      };
    case "SET_SHOW_COMPARISON":
      return { ...state, showComparison: action.payload };
    case "RESET_UI":
      return {
        isLoading: false,
        error: null,
        isEditMode: false,
        showComparison: false,
      };
    default:
      return state;
  }
};

const promptReducer = (state: Prompts, action: PromptAction): Prompts => {
  switch (action.type) {
    case "SET_GENERATE_PROMPT":
      return { ...state, generate: action.payload };
    case "SET_EDIT_PROMPT":
      return { ...state, edit: action.payload };
    case "CLEAR_PROMPTS":
      return { generate: "", edit: "" };
    default:
      return state;
  }
};

// Custom hook
export const useImageVersioning = () => {
  // State
  const [imageState, imageDispatch] = useReducer(imageReducer, {
    current: null,
    previous: null,
    original: null,
    hasBeenEdited: false,
  });

  const [uiState, uiDispatch] = useReducer(uiReducer, {
    isLoading: false,
    error: null,
    isEditMode: false,
    showComparison: false,
  });

  const [prompts, promptDispatch] = useReducer(promptReducer, {
    generate:
      "A cyberpunk street scene with neon lights, holograms, rain-slicked pavement, dramatic shadows, Blade Runner aesthetic, cinematic composition, moody atmosphere, steam rising from manholes, flying cars overhead, neon signs in Japanese and English, high contrast lighting, sci-fi movie still quality",
    edit: "",
  });

  // No cleanup needed - all functions are stable and don't create closures

  // Actions
  const addEdit = useCallback((data: ImageData) => {
    startTransition(() => {
      imageDispatch({ type: "ADD_EDIT", payload: data });
    });
  }, []);

  const resetToOriginal = useCallback(() => {
    startTransition(() => {
      imageDispatch({ type: "RESET_TO_ORIGINAL" });
    });
  }, []);

  const setCurrent = useCallback((data: ImageData) => {
    imageDispatch({ type: "SET_CURRENT", payload: data });
  }, []);

  const setPrevious = useCallback((data: ImageData) => {
    imageDispatch({ type: "SET_PREVIOUS", payload: data });
  }, []);

  const setOriginal = useCallback((data: ImageData) => {
    imageDispatch({ type: "SET_ORIGINAL", payload: data });
  }, []);

  const clearImages = useCallback(() => {
    imageDispatch({ type: "CLEAR_IMAGES" });
  }, []);

  // UI Actions
  const setLoading = useCallback((loading: boolean) => {
    uiDispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    uiDispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const enterEditMode = useCallback(() => {
    uiDispatch({ type: "SET_EDIT_MODE", payload: true });
  }, []);

  const exitEditMode = useCallback(() => {
    uiDispatch({ type: "SET_EDIT_MODE", payload: false });
  }, []);

  const toggleComparison = useCallback(() => {
    startTransition(() => {
      uiDispatch({
        type: "SET_SHOW_COMPARISON",
        payload: !uiState.showComparison,
      });
    });
  }, [uiState.showComparison]);

  const resetUI = useCallback(() => {
    uiDispatch({ type: "RESET_UI" });
  }, []);

  // Prompt Actions
  const setGeneratePrompt = useCallback((prompt: string) => {
    promptDispatch({ type: "SET_GENERATE_PROMPT", payload: prompt });
  }, []);

  const setEditPrompt = useCallback((prompt: string) => {
    promptDispatch({ type: "SET_EDIT_PROMPT", payload: prompt });
  }, []);

  const clearPrompts = useCallback(() => {
    promptDispatch({ type: "CLEAR_PROMPTS" });
  }, []);

  // Simple comparison logic - previous vs current
  const getComparisonImages = useCallback(() => {
    // Special case: when editing and loading, show current version on left, loading on right
    if (uiState.isEditMode && uiState.isLoading) {
      return {
        left: imageState.current,
        right: null, // Will show loading state
        leftLabel: "Current",
        rightLabel: "Editing...",
        isLoading: true,
      };
    }

    // Show previous vs current when both exist
    if (imageState.previous && imageState.current) {
      return {
        left: imageState.previous,
        right: imageState.current,
        leftLabel: "Previous",
        rightLabel: "Current",
        isLoading: false,
      };
    }

    // Show original vs current when no previous exists
    if (imageState.original && imageState.current) {
      return {
        left: imageState.original,
        right: imageState.current,
        leftLabel: "Original",
        rightLabel: "Current",
        isLoading: false,
      };
    }

    // Fallback
    return {
      left: null,
      right: null,
      leftLabel: "",
      rightLabel: "",
      isLoading: false,
    };
  }, [uiState, imageState]);

  return {
    // State
    imageState,
    uiState,
    prompts,

    // Image management
    addEdit,
    resetToOriginal,
    setCurrent,
    setPrevious,
    setOriginal,
    clearImages,

    // UI management
    setLoading,
    setError,
    enterEditMode,
    exitEditMode,
    toggleComparison,
    resetUI,

    // Prompt management
    setGeneratePrompt,
    setEditPrompt,
    clearPrompts,

    // Computed values
    getComparisonImages,
  };
};
