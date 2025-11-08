"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { headers } from "next/headers";
import { createErrorResponse, createSuccessResponse, type ImageResult, validateFiles } from "../utils/image-utils";
import { checkRateLimit } from "../utils/rate-limit";

export async function generateImage({ prompt }: { prompt: string }): Promise<ImageResult> {
  try {
    // Check rate limit using Next.js headers for server actions
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";
    const slug = "ai-sdk-google-image"; // Unique identifier for this app
    const rateLimitIdentifier = `${ipAddress}:${slug}`;
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier);
    if (!rateLimitResult.success) {
      return createErrorResponse("Rate limit exceeded. Please try again later.");
    }

    // Generate image
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

