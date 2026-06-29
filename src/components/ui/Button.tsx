import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-600",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
} as const;

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "ghost"
  | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Button({
  variant = "primary",
  leftIcon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 md:w-fit ${variants[variant]} ${className}`}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
