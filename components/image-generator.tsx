"use client";

import { type FormEvent } from "react";
import { generateImage } from "../lib/actions/create-image-action";
import { editImage } from "../lib/actions/edit-image-action";
import {
  ImageVersioningProvider,
  useImageActions,
  useImageState,
  usePromptActions,
  useUIActions,
  useUIState,
} from "../hooks/image-version-context";
import { extractImageData, type ImageData } from "../lib/utils/image-utils";
import { HeaderSection } from "./block-header";
import {
  ActionButtons,
  ComparisonGrid,
  ErrorState,
  LoadingState,
  SingleImageView,
} from "./image-display";
import {
  CreateImageInput,
  EditImageInput,
  EmptyStateFileDropper,
} from "./image-inputs";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

// Main component with context provider
export function ImageGenerator() {
  return (
    <ImageVersioningProvider>
      <ImageDemoContent />
    </ImageVersioningProvider>
  );
}

// Content component that uses context
function ImageDemoContent() {
  const imageState = useImageState();
  const uiState = useUIState();
  const { setLoading, setError, enterEditMode } = useUIActions();
  const { addEdit, setOriginal, setCurrent } = useImageActions();
  const { setGeneratePrompt, setEditPrompt } = usePromptActions();

  const handleCreateImage = async (promptText: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await generateImage({ prompt: promptText });

      if (result.success && result.data) {
        setCurrent(result.data);
        setOriginal(result.data);

        enterEditMode();
        setGeneratePrompt("");
      } else {
        setError(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async (editPromptText: string) => {
    if (!imageState.current) {
      setError("No image available to edit");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await editImage({
        prompt: editPromptText,
        imageData: imageState.current,
      });

      if (result.success && result.data) {
        addEdit(result.data);
        setEditPrompt("");
      } else {
        setError(result.error || "Failed to edit image");
      }
    } catch (error) {
      console.error("Error editing image:", error);
      setError("Failed to edit image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert File to ImageData
  const convertFileToImageData = async (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          // Remove data URL prefix to get just the base64 string
          const base64 = result.split(",")[1];
          resolve({
            base64,
            mediaType: file.type,
          });
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: any[]) => {
    // Only allow file upload when no image exists
    if (imageState.current) {
      setError(
        "File upload is only available when no image exists. Please generate an image first or reset to upload a new one."
      );
      return;
    }

    // Check if files exist
    if (!files || files.length === 0) {
      return;
    }

    // Filter for image files only
    const imageFiles = files.filter(
      (file) =>
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg"
    );

    if (imageFiles.length === 0) {
      setError("Please upload only PNG or JPG image files.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Process the first uploaded file
      const file = imageFiles[0];

      // Convert File to ImageData format
      const imageData = await convertFileToImageData(file);

      if (imageData) {
        // Set as original and current
        setOriginal(imageData);
        setCurrent(imageData);

        // Enter edit mode with comparison enabled
        enterEditMode();

        // Pre-populate edit prompt with a helpful suggestion
        setEditPrompt(
          "Enhance the image with better lighting, colors, and creative effects"
        );
      } else {
        setError("Failed to process uploaded image");
      }
    } catch (error) {
      console.error("Error processing uploaded image:", error);
      setError("Failed to process uploaded image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const promptText = message.text?.trim() || "";

    if (!promptText) {
      setError("Please enter a prompt");
      return;
    }

    await handleCreateImage(promptText);
  };

  const handleEditSubmit = async (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const promptText = message.text?.trim() || "";

    if (!promptText) {
      setError("Please enter a prompt");
      return;
    }

    await handleEditImage(promptText);
  };

  return (
    <div className="relative mx-auto max-w-3xl p-2 md:p-6 lg:pt-12">
      <div className="flex h-full flex-col">
        <HeaderSection />

        <div className="flex h-full flex-col">
          <div className="p-2 sm:overflow-y-auto md:p-4">
            {/* Main Content Area */}
            {imageState.current && !uiState.error && (
              <div className="flex flex-col items-center gap-4">
                {uiState.showComparison ? (
                  <ComparisonGrid />
                ) : (
                  <SingleImageView />
                )}
                <ActionButtons />
              </div>
            )}

            {/* Loading State */}
            {uiState.isLoading && !uiState.isEditMode && (
              <LoadingState isEditMode={uiState.isEditMode} />
            )}

            {/* Error State */}
            {uiState.error && (
              <ErrorState
                error={uiState.error}
                isEditMode={uiState.isEditMode}
              />
            )}
          </div>

          {/* Input Section */}
          <div className="mt-12">
            {imageState.current || uiState.isLoading ? (
              uiState.isEditMode ? (
                <>
                  <EditImageInput onSubmit={handleEditSubmit} />
                </>
              ) : (
                <CreateImageInput onSubmit={handleCreateSubmit} />
              )
            ) : (
              <div className="space-y-6">
                <EmptyStateFileDropper onFileUpload={handleFileUpload} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or generate with AI
                    </span>
                  </div>
                </div>
                <CreateImageInput onSubmit={handleCreateSubmit} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
