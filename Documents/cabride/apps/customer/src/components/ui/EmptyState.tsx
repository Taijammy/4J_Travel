interface Props {
  icon:        string;
  title:       string;
  description: string;
  action?:     { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-[#1a1a1a] border border-[#252525] rounded-2xl flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">{description}</p>
      {action && (
        <button onClick={action.onClick}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
