import { cn } from "@/lib/utils/cn";

// Brand mark: coral star with sun + teal accents.
// Sized via className (e.g. "h-9 w-9"). Background must be set by the parent if needed.
export function Logo({ className, title = "BezEkrana" }: { className?: string; title?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("inline-block", className)}
    >
      <title>{title}</title>
      <path
        d="M12 3L13.8 8.2H19L14.8 11.4L16.6 16.6L12 13.4L7.4 16.6L9.2 11.4L5 8.2H10.2L12 3Z"
        fill="#FF6B6B"
      />
      <circle cx="18" cy="5" r="2" fill="#FFD93D" />
      <circle cx="6" cy="18" r="1.5" fill="#4ECDC4" />
    </svg>
  );
}
