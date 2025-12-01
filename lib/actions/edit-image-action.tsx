"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  createDataUrl,
  createErrorResponse,
  createSuccessResponse,
  extractImageData,
  type ImageData,
  type ImageResult,
  processImageData,
  validateFiles,
} from "../utils/image-utils";

export async function editImage({
  prompt,
  imageData,
}: {
  prompt: string;
  imageData: ImageData;
}): Promise<ImageResult> {
  try {
    let processedImageData;
    try {
      processedImageData = processImageData(imageData);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Invalid image data format."
      );
    }

    const editPrompt = [
      {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            image: createDataUrl(processedImageData),
          },
          {
            type: "text" as const,
            text: `Please edit this image according to the following instructions: ${prompt}. 
            Return the edited image with the requested changes applied.`,
          },
        ],
      },
    ];

    const { files } = await generateText({
      prompt: editPrompt,
      model: google("gemini-2.5-flash-image-preview"),
      providerOptions: {
        google: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      },
    });

    // Validate and extract edited image data
    const file = validateFiles(files);
    const editedImageData = extractImageData(file);

    return createSuccessResponse(editedImageData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return createErrorResponse(errorMessage);
  }
}

