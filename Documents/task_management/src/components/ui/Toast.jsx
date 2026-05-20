// src/components/ui/Toast.jsx
const Toast = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;
  const colors = {
    success: 'border-l-4 border-green-400',
    error:   'border-l-4 border-accent',
    info:    'border-l-4 border-accent2',
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`bg-ink text-white px-4 py-3 rounded-xl text-sm font-medium
                      shadow-xl cursor-pointer max-w-xs animate-fade-up
                      ${colors[t.type] || colors.success}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};
export default Toast;