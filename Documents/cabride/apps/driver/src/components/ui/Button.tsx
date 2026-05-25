import { ButtonHTMLAttributes } from "react";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"ghost"|"danger"|"success";
  size?:    "sm"|"md"|"lg";
  loading?: boolean;
  full?:    boolean;
}
const variants = {
  primary:   "bg-yellow-400 hover:bg-yellow-300 text-black font-semibold",
  secondary: "bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a]",
  ghost:     "hover:bg-[#1e1e1e] text-gray-400 hover:text-white",
  danger:    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  success:   "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20",
};
const sizes = { sm: "px-3 py-2 text-xs rounded-lg", md: "px-4 py-2.5 text-sm rounded-xl", lg: "px-5 py-3.5 text-sm rounded-xl" };

export default function Button({ variant="primary", size="md", loading, full, children, disabled, className="", ...rest }: Props) {
  return (
    <button disabled={disabled||loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${full?"w-full":""} ${className}`}
      {...rest}>
      {loading && <span className="spinner !w-4 !h-4" />}
      {children}
    </button>
  );
}
