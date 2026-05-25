import { InputHTMLAttributes } from "react";
interface Props extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export default function Input({ label, error, className="", ...rest }: Props) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>}
      <input className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all ${error?"border-red-500/50 focus:border-red-500":"border-[#2a2a2a] focus:border-yellow-400/60"} ${className}`} {...rest} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
