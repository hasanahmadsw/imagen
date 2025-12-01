"use client";

import { useState } from "react";
import { editCarBackground } from "@/lib/actions/edit-car-background";

export default function CarEditor() {
  const [original, setOriginal] = useState<string | null>(null);
  const [backgroundRemoved, setBackgroundRemoved] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("showroom");

  async function handleFile(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setOriginal(base64);
  }

  async function process() {
    if (!original) return;

    setLoading(true);
    setEdited(null);
    setBackgroundRemoved(null);

    const cleanBase64 = original.split(",")[1];

    const result = await editCarBackground({
      imageBase64: cleanBase64,
      backgroundStyle: style as any,
    });

    if (result.success) {
      if (result.data?.base64) {
        setEdited(`data:${result.data.mediaType};base64,${result.data.base64}`);
      }
    }
    
    // Always set background removed image if available (even on error)
    if (result.backgroundRemoved?.base64) {
      const bgRemovedUrl = `data:${result.backgroundRemoved.mediaType};base64,${result.backgroundRemoved.base64}`;
      console.log("Setting background removed image:", bgRemovedUrl.substring(0, 50) + "...");
      setBackgroundRemoved(bgRemovedUrl);
    } else {
      console.log("No background removed image in result:", result);
    }

    setLoading(false);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">🛠️ AI Car Background Editor</h2>

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleFile} />

      {/* Style selector */}
      <div className="flex gap-4">
        <label>Background:</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="showroom">Showroom</option>
          <option value="street">Street</option>
          <option value="desert">Desert</option>
          <option value="studio">Studio</option>
        </select>
      </div>

      {/* Process button */}
      <button
        onClick={process}
        disabled={!original || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing..." : "Apply AI Background"}
      </button>

      {/* Display images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* Original */}
        {original && (
          <div>
            <p className="mb-2 font-semibold">Original:</p>
            <img src={original} className="w-full rounded shadow" />
          </div>
        )}

        {/* Background Removed */}
        {backgroundRemoved && (
          <div>
            <p className="mb-2 font-semibold">Background Removed:</p>
            <div className="w-full rounded shadow bg-gray-100 p-2">
              <img src={backgroundRemoved} className="w-full rounded" />
            </div>
          </div>
        )}

        {/* AI Edited */}
        {edited && (
          <div>
            <p className="mb-2 font-semibold">AI Edited:</p>
            <img src={edited} className="w-full rounded shadow" />
          </div>
        )}
      </div>
    </div>
  );
}
