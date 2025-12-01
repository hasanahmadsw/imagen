"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Simple helper
function bufferToBase64(buffer: Buffer, mime: string) {
  return {
    base64: buffer.toString("base64"),
    mediaType: mime,
  };
}

export async function editCarBackground({
  imageBase64,
  backgroundStyle,
}: {
  imageBase64: string;
  backgroundStyle: "showroom" | "street" | "desert" | "studio";
}) {
  let carPng: Buffer | undefined;
  
  try {
    // ---------------------------------------
    // 1) Decode original image
    // ---------------------------------------
    const inputBuffer = Buffer.from(imageBase64, "base64");

    // ---------------------------------------
    // 2) remove.bg → Get car cutout
    // ---------------------------------------
    const removeBgRes = await axios({
      method: "POST",
      url: "https://api.remove.bg/v1.0/removebg",
      data: {
        image_file_b64: imageBase64,
        size: "auto",
      },
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY!,
      },
      responseType: "arraybuffer",
    });

    carPng = Buffer.from(removeBgRes.data);

    // ---------------------------------------
    // 3) Build baseScene + mask
    // ---------------------------------------
    const sharp = (await import("sharp")).default;

    const meta = await sharp(carPng).metadata();

    const baseScene = await sharp({
      create: {
        width: meta.width!,
        height: meta.height!,
        channels: 3,
        background: "#999999",
      },
    })
      .png()
      .composite([{ input: carPng }])
      .toBuffer();

    const mask = await sharp(carPng)
      .extractChannel("alpha")
      .toColourspace("b-w")
      .threshold(0)
      .negate()
      .toBuffer();

    // ---------------------------------------
    // 4) Prepare prompt
    // ---------------------------------------
    const prompts = {
      showroom: `Luxury indoor car showroom, glossy floor, soft lighting, photorealistic, 8k`,
      street: `Dubai clean highway street, golden hour, photorealistic, 8k`,
      desert: `UAE desert dunes background, warm lighting, photorealistic, 8k`,
      studio: `Professional photo studio background, grey tone, softbox lighting, 8k`,
    };

    const backgroundPrompt = prompts[backgroundStyle] ?? prompts.showroom;

    // ---------------------------------------
    // 5) Call Gemini Image directly using Google Generative AI SDK
    // Note: Gemini doesn't support mask field, so we pass mask as second image with instructions
    // ---------------------------------------
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = `I'm providing two images:
1. First image: A car on a gray background that needs background replacement
2. Second image: A mask image where WHITE areas indicate what should be REPLACED and BLACK areas indicate what should be KEPT

Please replace ONLY the background (white areas in the mask) with: ${backgroundPrompt}.
Keep the car completely identical - do NOT redraw, modify, or change the vehicle in any way. Only replace the background areas.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: baseScene.toString("base64"),
              },
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: mask.toString("base64"),
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract image from response
    const response = result.response;
    const candidates = response.candidates;
    
    if (!candidates || candidates.length === 0) {
      throw new Error("No output returned from Gemini.");
    }

    const candidate = candidates[0];
    const parts = candidate.content?.parts;
    
    if (!parts || parts.length === 0) {
      throw new Error("No content parts in response.");
    }

    // Find the image part
    const imagePart = parts.find((part: any) => part.inlineData?.mimeType?.startsWith("image/"));
    
    if (!imagePart?.inlineData) {
      throw new Error("No image data in response.");
    }

    const backgroundRemovedImage = {
      base64: carPng.toString("base64"),
      mediaType: "image/png",
    };

    return {
      success: true,
      data: {
        base64: imagePart.inlineData.data,
        mediaType: imagePart.inlineData.mimeType,
      },
      backgroundRemoved: backgroundRemovedImage,
    };
  } catch (err: any) {
    console.error("Edit Car Error:", err);
    
    // Even on error, try to return the background removed image if we have it
    let backgroundRemovedImage = null;
    if (carPng) {
      try {
        backgroundRemovedImage = {
          base64: carPng.toString("base64"),
          mediaType: "image/png",
        };
      } catch (e) {
        console.error("Error encoding background removed image:", e);
      }
    }
    
    return {
      success: false,
      error: err.message || "Failed to edit car background",
      backgroundRemoved: backgroundRemovedImage,
    };
  }
}

