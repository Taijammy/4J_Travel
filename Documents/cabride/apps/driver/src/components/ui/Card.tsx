import { HTMLAttributes } from "react";
interface Props extends HTMLAttributes<HTMLDivElement> { padding?: "none"|"sm"|"md"|"lg"; }
const paddings = { none:"", sm:"p-4", md:"p-5", lg:"p-6" };
export default function Card({ padding="md", children, className="", ...rest }: Props) {
  return (
    <div className={`bg-[#1a1a1a] border border-[#252525] rounded-2xl ${paddings[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
