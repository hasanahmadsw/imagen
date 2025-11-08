import { ImageGenerator } from "../components/image-generator";

export const maxDuration = 120;

export default function Page() {
  return (
    <div className="mx-auto min-h-full w-screen bg-muted">
      <ImageGenerator />
    </div>
  );
}
