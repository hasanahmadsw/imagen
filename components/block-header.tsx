import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function HeaderSectionCallout({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary text-xs font-medium">
      {children}
    </span>
  );
}

function HeaderSectionLink({
  href,
  children,
  isCodeExample = false,
}: {
  href: string;
  children: React.ReactNode;
  isCodeExample?: boolean;
}) {
  return (
    <a
      className={cn(
        "group inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-border/30 px-2 py-1 text-xs transition-colors hover:border-border/50 hover:text-blue-600",
        isCodeExample && "font-mono text-[11px] text-foreground/70"
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLink className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function HeaderSectionHeading({
  title = "",
  subtitle = "",
  patternType,
}: {
  title: string;
  subtitle: string;
  patternType: string;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground/70">
            {subtitle}
          </span>
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-foreground/70">
            {patternType}
          </span>
        </div>
      </div>
    </div>
  );
}

function SdkItemsUsed({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <HeaderSectionLink href={item.href} isCodeExample key={item.href}>
          {item.label}
        </HeaderSectionLink>
      ))}
    </div>
  );
}

/**
 * Header Section Component
 *
 * Displays the main title, current stage information, and tool descriptions.
 * Shows different content based on whether there are results and current status.
 */
export const HeaderSection = () => (
  <div className={cn("space-y-4")}>
    <HeaderSectionHeading
      patternType="Gemini Flash Image Edit"
      subtitle="AI SDK v5"
      title="Gemini Flash Image Edit"
    />

    <div className={cn("space-y-3")}>
      <p className="max-w-2xl text-sm leading-6 text-foreground/80">
        Generate and edit images using Gemini's{" "}
        <HeaderSectionCallout>
          gemini-2.5-flash-image-preview
        </HeaderSectionCallout>{" "}
        model. Create new images from text prompts or edit existing ones with
        natural language instructions. Images are exposed as files in the
        response with full editing capabilities.
      </p>
      <SdkItemsUsed
        items={[
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#generatetext",
            label: "generateText()",
          },
          {
            href: "https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway#ai-gateway-provider",
            label: "google()",
          },
        ]}
      />
    </div>
  </div>
);
