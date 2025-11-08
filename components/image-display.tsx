"use client";

import { AlertTriangleIcon, Download, Edit3, Maximize2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Image } from "@/components/ai-elements/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useImageActions,
  useImageComputed,
  useImageState,
  useUIActions,
  useUIState,
} from "../hooks/image-version-context";
import { Countdown } from "./countdown";
import type { ImageData } from "../lib/utils/image-utils";

function ComparisonImage({
  image,
  alt,
  className = "h-[280px] md:h-[300px] aspect-square border rounded-lg",
  showActions = false,
}: {
  image: any;
  alt: string;
  className?: string;
  showActions?: boolean;
}) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  if (!image) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-muted/50`}
      >
        <p className="text-muted-foreground text-sm">No image</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!image.base64) return;

    try {
      const byteCharacters = atob(image.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: image.mediaType || "image/png" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${Date.now()}.${image.mediaType?.split("/")[1] || "png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const imageSrc = image.base64
    ? `data:${image.mediaType || "image/png"};base64,${image.base64}`
    : "";

  return (
    <div className="group relative">
      <Image
        alt={alt}
        base64={image.base64 || ""}
        className={className}
        mediaType={image.mediaType || "image/png"}
        uint8Array={image.uint8Array}
      />
      {showActions && imageSrc && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white"
            onClick={() => setIsFullscreenOpen(true)}
            size="sm"
            variant="secondary"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white"
            onClick={handleDownload}
            size="sm"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative flex items-center justify-center w-full h-full min-h-[50vh] max-h-[90vh] p-4">
            <img
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              src={imageSrc}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={handleDownload}
                size="sm"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LoadingState({ isEditMode }: { isEditMode: boolean }) {
  const averageTime = isEditMode ? 60 : 12;
  
  return (
    <div className="flex justify-center">
      <div className="flex aspect-square h-[280px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed bg-background/10 text-center md:h-[300px]">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-foreground">
            {isEditMode ? "Editing image..." : "Generating image..."}
          </h3>
          <div className="flex flex-col items-center gap-2">
            <Countdown className="scale-125" loading={true} />
            <p className="text-xs text-muted-foreground/70">
              Estimated time: <span className="font-medium text-muted-foreground">{averageTime}s</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span>Processing with AI...</span>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  error,
  isEditMode,
}: {
  error: string;
  isEditMode: boolean;
}) {
  return (
    <div className="flex justify-center">
      <div className="flex aspect-square h-[280px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-center md:h-[300px]">
        <AlertTriangleIcon className="mb-2 h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive text-lg">
          Error {isEditMode ? "editing" : "generating"} image
        </h3>
        <p className="max-w-[170px] text-pretty font-medium text-destructive text-sm tracking-tight">
          {error}
        </p>
      </div>
    </div>
  );
}

function EditedResultPlaceholder() {
  return (
    <div className="flex aspect-square h-[280px] flex-col items-center justify-center rounded-lg border border-border border-dashed bg-muted/5 md:h-[300px]">
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm">
          Edited Result
        </p>
        <p className="mt-1 text-muted-foreground/60 text-xs">
          Your changes will appear here
        </p>
      </div>
    </div>
  );
}

function RightComparisonContent({
  isLoading,
  rightImage,
  isEditMode,
  showPlaceholder,
}: {
  isLoading: boolean;
  rightImage: any;
  isEditMode: boolean;
  showPlaceholder: boolean;
}) {
  if (isLoading) {
    return <LoadingState isEditMode={isEditMode} />;
  }

  if (showPlaceholder) {
    return <EditedResultPlaceholder />;
  }

  if (rightImage) {
    return <ComparisonImage alt="Comparison right" image={rightImage} showActions={true} />;
  }

  return <EditedResultPlaceholder />;
}

export function ComparisonGrid() {
  const uiState = useUIState();
  const { getComparisonImages } = useImageComputed();

  const comparisonImages = getComparisonImages();

  const showPlaceholder = useMemo(() => {
    if (!(comparisonImages?.left?.base64 && comparisonImages?.right?.base64)) {
      return false;
    }
    return (
      comparisonImages.left.base64.slice(0, 100) ===
      comparisonImages.right.base64.slice(0, 100)
    );
  }, [comparisonImages?.left?.base64, comparisonImages?.right?.base64]);

  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-medium text-muted-foreground text-sm">
            {comparisonImages.leftLabel}
          </h3>
          <ComparisonImage
            alt="Comparison left"
            image={comparisonImages.left}
            showActions={true}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-medium text-muted-foreground text-sm">
            {comparisonImages.rightLabel}
          </h3>
          <RightComparisonContent
            isEditMode={uiState.isEditMode}
            isLoading={comparisonImages.isLoading}
            rightImage={comparisonImages.right}
            showPlaceholder={showPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

export function SingleImageView() {
  const imageState = useImageState();
  const uiState = useUIState();
  const { enterEditMode } = useUIActions();

  return (
    <div className="group relative">
      <ComparisonImage
        alt={uiState.isEditMode ? "Image being edited" : "Generated image"}
        image={imageState.current}
        showActions={true}
      />
      {!uiState.isEditMode && (
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="h-8 w-8 p-0 bg-black/70 hover:bg-black/80 text-white"
            onClick={enterEditMode}
            size="sm"
            variant="secondary"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!imageState.previous && (
        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
          Click Edit to create variations
        </div>
      )}
    </div>
  );
}

export function ActionButtons() {
  const imageState = useImageState();
  const uiState = useUIState();
  const { enterEditMode, toggleComparison } = useUIActions();
  const { resetToOriginal } = useImageActions();

  const handleResetToOriginal = () => {
    if (imageState.original) {
      resetToOriginal();
    }
  };

  if (!imageState.current) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {!uiState.isEditMode && (
        <Button
          className="flex items-center gap-2"
          onClick={enterEditMode}
          size="sm"
          variant="outline"
        >
          <Edit3 className="h-4 w-4" />
          Edit Image
        </Button>
      )}
      {!uiState.isEditMode && imageState.previous && (
        <Button
          className="flex items-center gap-2"
          onClick={toggleComparison}
          size="sm"
          variant="outline"
        >
          {uiState.showComparison ? "Hide" : "Show"} Comparison
        </Button>
      )}
      {imageState.previous && (
        <Button
          className="flex items-center gap-2"
          onClick={handleResetToOriginal}
          size="sm"
          variant="outline"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Original
        </Button>
      )}
    </div>
  );
}

