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
import { checkRateLimit } from "../utils/rate-limit";

export async function editImage({
  prompt,
  imageData,
}: {
  prompt: string;
  imageData: ImageData;
}): Promise<ImageResult> {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit("ai-sdk-google-image-edit");
    if (!rateLimitResult.success) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later."
      );
    }

    // Process image data using utility function
    let processedImageData;
    try {
      processedImageData = processImageData(imageData);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error.message : "Invalid image data format."
      );
    }

    // Create the editing prompt with inline image data
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

    // Edit image using Gemini with inline data
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

