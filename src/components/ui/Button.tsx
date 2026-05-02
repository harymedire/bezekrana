import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "yellow" | "plum" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  yellow: "btn-yellow",
  plum: "btn-plum",
  ghost: "btn-ghost",
};

const sizeClass: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-7 py-3.5",
  lg: "text-lg px-9 py-4",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(variantClass[variant], size !== "md" && sizeClass[size], className)}
      {...rest}
    />
  );
});
