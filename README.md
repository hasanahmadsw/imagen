# AI Image Generation

A powerful image generation and editing that leverages Google's Gemini 2.5 Flash Image Preview model through the Vercel AI SDK. This block provides an intuitive interface for generating images from text prompts and editing them with natural language instructions, complete with rate limiting, fullscreen viewing, download capabilities, and comprehensive error handling.

## Features

- **Image Generation**: Create images from detailed text prompts
- **Image Editing**: Edit existing images using natural language instructions
- **Before/After Comparison**: Side-by-side view of original and edited images
- **Fullscreen View**: Click any image to view it in fullscreen mode
- **Download Images**: Download generated or edited images with one click
- **Interactive Workflow**: Seamless transition between generation and editing modes
- **Edit Suggestions**: Pre-built editing prompts for common modifications
- **Image Upload**: Upload existing images to edit
- **Undo/Reset**: Reset to original image or undo changes
- **Real-time Processing**: Stream results as they're generated
- **Quick Prompts**: Pre-built prompts for both generation and editing
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Visual Feedback**: Enhanced loading states with real-time countdown timer

## Quick Prompts

The block comes with several pre-built prompts for both generation and editing, located in `lib/data/`:

### Image Generation Prompts

- **Cyberpunk Street**: Neon-lit urban scenes with sci-fi aesthetics
- **Sticker**: Kawaii-style sticker designs
- **Logo**: Modern minimalist logo designs
- **Product Photograph**: High-resolution product photography
- **Minimalist Leaf**: Clean minimalist compositions
- **Comic Book Panel**: Gritty noir art style panels

### Image Editing Prompts

- **Add Objects**: Add new elements to images
- **3D Figure**: Create commercialized figurines
- **Change Background**: Replace backgrounds seamlessly
- **Style Transfer**: Transform artistic styles
- **Color Correction**: Enhance colors and vibrancy
- **Add Lighting**: Add dramatic lighting effects
- **Change Season**: Transform scenes to different seasons
- **Add Text/Logo**: Overlay text or logos
- **Remove Objects**: Clean up unwanted elements
- **Change Mood**: Adjust atmosphere and mood
- **Add Reflections**: Create realistic reflections
- **Change Perspective**: Adjust viewing angles
- **Add Weather Effects**: Add rain, snow, or other weather

## Setup

### Prerequisites

- Node.js 18+
- Next.js 15+ with App Router
- Google AI API access
- Upstash Redis (for rate limiting)

### Installation

1. **Install Dependencies**

```bash
pnpm install @ai-sdk/google ai @upstash/ratelimit @upstash/redis
```

1. **Environment Variables**

Create a `.env.local` file in your project root:

```env
# Google AI API Key (for Gemini models)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

1. **Google AI API Setup**

- Visit [Google AI Studio](https://aistudio.google.com/)
- Create a new API key
- Enable the Gemini API for your project

1. **Upstash Redis Setup**

- Sign up at [Upstash](https://upstash.com/)
- Create a Redis database
- Copy the REST URL and token

1. **Next.js Configuration**

The project includes server action body size limit configuration in `next.config.ts`:

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: "10mb",
  },
}
```

### Usage

1. **Import the Component**

```tsx
import { ImageGenerator } from "@/components/image-generator";

export default function Page() {
  return (
    <div className="mx-auto min-h-full w-screen bg-muted">
      <ImageGenerator />
    </div>
  );
}
```

## Project Structure

```text
├── app/
│   ├── page.tsx                 # Main page component
│   ├── layout.tsx               # App layout
│   └── globals.css              # Global styles
├── components/
│   ├── image-generator.tsx      # Main container component
│   ├── image-display.tsx        # Image display components
│   ├── image-inputs.tsx         # Input components
│   ├── block-header.tsx         # Header section
│   ├── countdown.tsx            # Loading timer component
│   └── dropzone.tsx             # File upload component
├── lib/
│   ├── actions/
│   │   ├── create-image-action.tsx  # Image generation server action
│   │   └── edit-image-action.tsx   # Image editing server action
│   ├── data/
│   │   ├── image-suggestions.ts    # Image generation prompts
│   │   └── edit-suggestions.ts     # Image editing prompts
│   └── utils/
│       ├── image-utils.ts          # Image processing utilities
│       └── rate-limit.ts           # Rate limiting utilities
└── hooks/
    ├── image-version-context.tsx   # Image state management
    └── use-image-version.ts       # Image versioning hook
```

## API Reference

### `generateImage(data: ImageGenerationData)`

Generates images using Google's Gemini model.

**Location**: `lib/actions/create-image-action.tsx`

**Parameters:**

- `data.prompt`: Image generation prompt string

**Returns:**

- Object containing `success`, `data` (with base64, uint8Array, mediaType), and `error`

### `editImage(data: ImageEditData)`

Edits images using Google's Gemini model with natural language instructions.

**Location**: `lib/actions/edit-image-action.tsx`

**Parameters:**

- `data.prompt`: Image editing instructions
- `data.imageData`: Original image data to edit (base64, uint8Array, or mediaType)

**Returns:**

- Object containing `success`, `data` (with base64, uint8Array, mediaType), and `error`

### `checkRateLimit(identifier: string)`

Checks rate limiting for API calls.

**Location**: `lib/utils/rate-limit.ts`

**Parameters:**

- `identifier`: Unique identifier for rate limiting

**Returns:**

- Object with success status, limits, reset time, remaining requests, and headers

### Types

```typescript
interface ImageData {
  base64?: string;
  uint8Array?: Uint8Array;
  mediaType?: string;
}

interface ImageResult {
  success: boolean;
  data: ImageData | null;
  error: string | null;
}
```

## Customization

### Adding Custom Prompts

Edit the prompt files in `lib/data/`:

**Image Generation Prompts** (`lib/data/image-suggestions.ts`):

```typescript
export const imageSuggestions = [
  {
    title: "Your Custom Prompt",
    prompt: "Your detailed prompt description here",
  },
  // ... existing prompts
];
```

**Image Editing Prompts** (`lib/data/edit-suggestions.ts`):

```typescript
export const editSuggestions = [
  {
    title: "Your Custom Edit",
    prompt: "Your editing instructions here",
  },
  // ... existing prompts
];
```

### Styling

The block uses Tailwind CSS and shadcn/ui components. Customize by modifying the component classes or extending the theme.

### Error Handling

The block includes comprehensive error handling for:

- File upload issues
- API rate limits
- Network errors
- Invalid file types
- Rate limit exceeded scenarios
- Server action body size limits

## Features in Detail

### Fullscreen Image View

- Hover over any image to see action buttons
- Click the maximize icon to open fullscreen
- Download directly from fullscreen view
- Dark backdrop for better image visibility

### Download Functionality

- Click the download icon on any image
- Images are downloaded with proper file extensions
- Automatic file naming with timestamps
- Supports PNG and JPEG formats

### Enhanced Loading Timer

- Real-time countdown with seconds and milliseconds
- Visual feedback with animated clock icon
- Estimated time display
- Processing status indicator

## Performance Considerations

- **File Size**: Server actions configured for up to 10MB body size
- **Image Processing**: Images are processed efficiently using base64 encoding
- **Rate Limiting**: 10 requests per day to prevent API abuse
- **Streaming**: Results are processed in real-time for better UX
- **Caching**: No client-side caching to ensure fresh results

## Security

- **File Validation**: Only PNG and JPEG image files are accepted
- **API Key**: Stored securely in environment variables
- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Server Actions**: Secure server-side processing

## Troubleshooting

### Common Issues

1. **"Body exceeded 1 MB limit"**
   - The `next.config.ts` includes server action body size limit configuration
   - Ensure `experimental.serverActions.bodySizeLimit` is set to "10mb" or higher

2. **"Rate limit exceeded"**
   - You've reached the daily limit of 10 requests
   - Wait until the next day or check your rate limit status
   - Verify your Upstash Redis configuration

3. **"Cannot find module '@ai-sdk/google'"**
   - Ensure `@ai-sdk/google` is installed: `pnpm install @ai-sdk/google`
   - Verify the package is listed in `package.json`

4. **"Error generating/editing image"**
   - Verify your `GOOGLE_GENERATIVE_AI_API_KEY` is correct
   - Check your API quota and billing status
   - Ensure the image file isn't corrupted

5. **Slow response times**
   - Large images may take longer to process
   - Check your internet connection
   - Verify Google AI API service status

### Debug Mode

Enable console logging by checking the browser console for detailed error messages.

## Examples

### Basic Image Generation

```typescript
import { generateImage } from "@/lib/actions/create-image-action";

const result = await generateImage({
  prompt: "A cyberpunk street scene with neon lights and rain-slicked pavement",
});

if (result.success && result.data) {
  // Use result.data.base64, result.data.uint8Array, or result.data.mediaType
}
```

### Image Editing

```typescript
import { editImage } from "@/lib/actions/edit-image-action";

const result = await editImage({
  prompt: "Add more dramatic lighting and enhance the neon colors",
  imageData: {
    base64: "...",
    mediaType: "image/png",
  },
});
```

## Contributing

This block follows modern React and Next.js patterns. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:

- Check the troubleshooting section above
- Review the [Google AI API documentation](https://ai.google.dev/docs)
- Review the [Vercel AI SDK documentation](https://ai-sdk.dev)
- Open an issue in the repository

---

Built using Next.js, Vercel AI SDK, Google's Gemini AI model, and Upstash Redis for rate limiting.
