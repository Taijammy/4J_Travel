export default function Logo({ size="md" }: { size?: "sm"|"md"|"lg" }) {
  const s = { sm:"text-lg", md:"text-xl", lg:"text-2xl" }[size];
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-black font-bold text-sm">4J</span>
      </div>
      <div>
        <span className={`font-bold ${s} tracking-tight text-white`}>4jtravel</span>
        <span className="ml-2 text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/20">Driver</span>
      </div>
    </div>
  );
}
