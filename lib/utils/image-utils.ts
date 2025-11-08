/**
 * Image processing utilities for AI SDK image operations
 *
 * This utility provides common functions for processing image data
 * across different AI SDK image generation and editing blocks.
 */

export type ImageData = {
  base64?: string;
  uint8Array?: Uint8Array;
  mediaType?: string;
};

export type ProcessedImageData = {
  base64Image: string;
  mimeType: string;
};

/**
 * Processes image data and converts it to the format expected by AI APIs
 *
 * Handles both base64 strings (with or without data URL prefix) and Uint8Array
 * and normalizes them to a consistent format for AI SDK operations.
 *
 * @param imageData - The input image data (base64, uint8Array, or both)
 * @returns Processed image data with base64 string and mime type
 * @throws Error if no valid image data is provided
 *
 * @example
 * ```typescript
 * const imageData = {
 *   base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
 *   mediaType: "image/jpeg"
 * };
 *
 * const processed = processImageData(imageData);
 * // Returns: { base64Image: "/9j/4AAQSkZJRgABAQAAAQ...", mimeType: "image/jpeg" }
 * ```
 */
export function processImageData(imageData: ImageData): ProcessedImageData {
  // Validate image data
  if (!(imageData.base64 || imageData.uint8Array)) {
    throw new Error("No image data provided for processing.");
  }

  let base64Image: string;
  let mimeType: string;

  if (imageData.base64) {
    // Remove data URL prefix if present
    base64Image = imageData.base64.replace(/^data:image\/[a-z]+;base64,/, "");
    mimeType = imageData.mediaType || "image/jpeg";
  } else if (imageData.uint8Array) {
    // Convert Uint8Array to base64
    base64Image = Buffer.from(imageData.uint8Array).toString("base64");
    mimeType = imageData.mediaType || "image/jpeg";
  } else {
    throw new Error("Invalid image data format.");
  }

  return {
    base64Image,
    mimeType,
  };
}

/**
 * Creates a data URL from processed image data
 *
 * @param processedData - The processed image data
 * @returns Data URL string in the format "data:image/jpeg;base64,..."
 *
 * @example
 * ```typescript
 * const processed = { base64Image: "/9j/4AAQ...", mimeType: "image/jpeg" };
 * const dataUrl = createDataUrl(processed);
 * // Returns: "data:image/jpeg;base64,/9j/4AAQ..."
 * ```
 */
export function createDataUrl(processedData: ProcessedImageData): string {
  return `data:${processedData.mimeType};base64,${processedData.base64Image}`;
}

/**
 * Validates that files array contains at least one file
 *
 * Common validation function for AI SDK responses that return file arrays.
 *
 * @param files - Array of files from AI SDK response
 * @returns The first file in the array
 * @throws Error if no files are provided
 *
 * @example
 * ```typescript
 * const { files } = await generateText({ ... });
 * const file = validateFiles(files);
 * ```
 */
export function validateFiles(files: any[]) {
  if (!files || files.length === 0) {
    throw new Error("No image was generated. Please try again.");
  }
  return files[0];
}

/**
 * Extracts image data from a file object returned by AI SDK
 *
 * @param file - File object from AI SDK response
 * @returns ImageData object with base64, uint8Array, and mediaType
 */
export function extractImageData(file: any): ImageData {
  return {
    base64: file?.base64,
    uint8Array: file?.uint8Array,
    mediaType: file?.mediaType,
  };
}

export type ImageResult = {
  success: boolean;
  data: ImageData | null;
  error: string | null;
};

export const createSuccessResponse = (data: any): ImageResult => ({
  success: true,
  data,
  error: null,
});

export const createErrorResponse = (error: string): ImageResult => ({
  success: false,
  data: null,
  error,
});

