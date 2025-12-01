"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createErrorResponse, createSuccessResponse, type ImageResult, validateFiles } from "../utils/image-utils";

export async function generateImage({ prompt }: { prompt: string }): Promise<ImageResult> {
  try {
    const { files } = await generateText({
      prompt,
      model: google("gemini-2.5-flash-image-preview"),
      providerOptions: {
        google: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      },
    });

    // Validate and extract image data
    const file = validateFiles(files);

    const imageData = {
      base64: file?.base64,
      uint8Array: file?.uint8Array,
      mediaType: file?.mediaType,
    };

    return createSuccessResponse(imageData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return createErrorResponse(errorMessage);
  }
}

