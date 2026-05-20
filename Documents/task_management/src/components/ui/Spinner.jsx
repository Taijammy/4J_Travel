// src/components/ui/Spinner.jsx
const Spinner = ({ size = 'md', color = 'white' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  const colors = { white: 'border-white/30 border-t-white', ink: 'border-ink/20 border-t-ink' };
  return (
    <span className={`inline-block ${sizes[size]} border-2 ${colors[color]}
                     rounded-full animate-spin`} />
  );
};
export default Spinner;