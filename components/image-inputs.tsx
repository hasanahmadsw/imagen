"use client";

import { useCallback, type FormEvent } from "react";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone";
import { editSuggestions } from "../lib/data/edit-suggestions";
import { imageSuggestions } from "../lib/data/image-suggestions";
import {
  usePromptActions,
  usePrompts,
  useUIState,
} from "../hooks/image-version-context";

type SuggestionItem = {
  title: string;
  prompt: string;
};

type PromptInputWithSuggestionsProps = {
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void;
  suggestions: SuggestionItem[];
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
};

/**
 * Reusable prompt input component with suggestions
 */
function PromptInputWithSuggestions({
  onSubmit,
  suggestions,
  placeholder,
  value,
  onValueChange,
  isLoading,
}: PromptInputWithSuggestionsProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onValueChange(e.currentTarget.value);
    },
    [onValueChange]
  );

  return (
    <div className="space-y-4">
      <Suggestions>
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion.title}
            onClick={() => onValueChange(suggestion.prompt)}
            suggestion={suggestion.prompt}
          >
            <div className="font-medium text-sm">{suggestion.title}</div>
          </Suggestion>
        ))}
      </Suggestions>

      <div className="relative">
        <PromptInput className="shadow-none border border-primary/10 rounded-2xl p-2 w-full" onSubmit={onSubmit}>
          {/* <PromptInputBody> */}
            <PromptInputTextarea
              className="pr-14 "
              onChange={handleChange}
              placeholder={placeholder}
              value={value}
            />
          {/* </PromptInputBody> */}
          <PromptInputSubmit
            disabled={!value.trim() || isLoading}
            status={isLoading ? "submitted" : "ready"}
          />
        </PromptInput>
      </div>
    </div>
  );
}

/**
 * File dropper component for empty state
 */
export function EmptyStateFileDropper({
  onFileUpload,
}: {
  onFileUpload: (files: File[]) => void;
}) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles);
      }
    },
    [onFileUpload]
  );

  return (
    <Dropzone
      accept={{
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
      }}
      maxFiles={1}
      maxSize={5 * 1024 * 1024} // 5MB
      onDrop={handleDrop}
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
}

/**
 * Input component for creating new images
 */
export function CreateImageInput({
  onSubmit,
}: {
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  const prompts = usePrompts();
  const uiState = useUIState();
  const { setGeneratePrompt } = usePromptActions();

  return (
    <PromptInputWithSuggestions
      isLoading={uiState.isLoading}
      onValueChange={setGeneratePrompt}
      onSubmit={onSubmit}
      placeholder="Describe your image in detail (style, mood, lighting, composition)..."
      suggestions={imageSuggestions}
      value={prompts.generate || ""}
    />
  );
}

/**
 * Input component for editing existing images
 */
export function EditImageInput({
  onSubmit,
}: {
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  const prompts = usePrompts();
  const uiState = useUIState();
  const { setEditPrompt } = usePromptActions();

  return (
    <PromptInputWithSuggestions
      isLoading={uiState.isLoading}
      onValueChange={setEditPrompt}
      onSubmit={onSubmit}
      placeholder="Describe how you want to edit the image..."
      suggestions={editSuggestions}
      value={prompts.edit || ""}
    />
  );
}
